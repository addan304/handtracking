import { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { useHand } from '../context/HandContext';

export default function HandTracker() {
    const videoRef = useRef(null);
    const handState = useHand();
    const [loaded, setLoaded] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const landmarkerRef = useRef(null);
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const streamRef = useRef(null);

    useEffect(() => {
        let animationFrameId;

        const setup = async () => {
            console.log("HandTracker: Starting setup...");

            // Timeout promise
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("AI Loading Timeout (10s)")), 10000)
            );

            try {
                // Race between loading and timeout
                await Promise.race([
                    (async () => {
                        const vision = await FilesetResolver.forVisionTasks(
                            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.32/wasm"
                        );

                        console.log("HandTracker: Vision tasks resolver loaded.");
                        landmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
                            baseOptions: {
                                modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
                                delegate: isMobile ? "CPU" : "GPU"
                            },
                            runningMode: "VIDEO",
                            numHands: 2
                        });
                        console.log("HandTracker: Landmarker created.");
                        await startWebcam();
                    })(),
                    timeoutPromise
                ]);

                setLoaded(true);
            } catch (e) {
                console.error("Tracker Init Error:", e);
                setErrorMsg('AI Init Failed: ' + e.message);
                setLoaded(true); // Allow app to continue even if AI fails
            }
        };

        const startWebcam = async () => {
            console.log("HandTracker: Starting webcam...");
            try {
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                }

                const constraints = {
                    video: {
                        facingMode: "user",
                        width: { ideal: 640 },
                        height: { ideal: 480 }
                    },
                    audio: false
                };

                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                console.log("HandTracker: Webcam stream acquired.");

                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = () => {
                        videoRef.current.play().catch(e => console.error("Play error:", e));
                        if (!animationFrameId) predictWebcam();
                    };
                }
            } catch (e) {
                console.error("Webcam Error:", e);
                setErrorMsg('Camera Access Error: ' + e.name);
                setLoaded(true);
            }
        };

        const dist = (p1, p2) => Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
        let lastVideoTime = -1;
        let lastFrameTime = performance.now();
        let lastDetectionTime = 0;
        const detectionInterval = (isMobile ? 30 : 16);

        const predictWebcam = () => {
            const now = performance.now();

            if (now - lastDetectionTime < detectionInterval) {
                animationFrameId = requestAnimationFrame(predictWebcam);
                return;
            }
            lastDetectionTime = now;

            if (videoRef.current && landmarkerRef.current) {
                if (videoRef.current.readyState >= 2) {
                    if (videoRef.current.paused) {
                        videoRef.current.play().catch(() => { });
                    }

                    if (videoRef.current.currentTime !== lastVideoTime) {
                        lastVideoTime = videoRef.current.currentTime;
                        lastFrameTime = now;

                        try {
                            const result = landmarkerRef.current.detectForVideo(videoRef.current, now);

                            if (result.landmarks && result.landmarks.length > 0) {
                                handState.current.isDetected = true;
                                handState.current.handCount = result.landmarks.length;

                                let totalOpenness = 0;
                                result.landmarks.forEach(landmarks => {
                                    const wrist = landmarks[0];
                                    const palmSize = dist(landmarks[0], landmarks[9]);
                                    const tips = [8, 12, 16, 20];
                                    let handAvgDist = 0;
                                    tips.forEach(idx => { handAvgDist += dist(landmarks[idx], wrist); });
                                    handAvgDist /= 4;
                                    const openness = (handAvgDist / palmSize - 0.95) / (1.5 - 0.95);
                                    totalOpenness += Math.max(0, Math.min(1, openness));
                                });

                                handState.current.openness = totalOpenness / result.landmarks.length;
                                handState.current.isOpen = handState.current.openness > 0.45;

                                const firstHand = result.landmarks[0][0];
                                handState.current.position = {
                                    x: -(firstHand.x - 0.5) * 3,
                                    y: -(firstHand.y - 0.5) * 2.5
                                };
                            } else {
                                // IMPORTANT: Reset state immediately if no hands found
                                handState.current.isDetected = false;
                                handState.current.handCount = 0;
                            }
                        } catch (err) {
                            console.error("Detect Error:", err);
                        }
                    }
                }
            }

            if (now - lastFrameTime > 3000) {
                console.warn("HandTracker: Heartbeat lost. Re-waking...");
                lastFrameTime = now;
                handState.current.isDetected = false;
                handState.current.handCount = 0;
                startWebcam();
            }

            animationFrameId = requestAnimationFrame(predictWebcam);
        };

        const handleVisibility = () => {
            if (document.visibilityState === 'visible') {
                startWebcam();
            }
        };

        setup();
        window.addEventListener('focus', handleVisibility);
        document.addEventListener('visibilitychange', handleVisibility);

        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            if (landmarkerRef.current) landmarkerRef.current.close();
            if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
            window.removeEventListener('focus', handleVisibility);
            document.removeEventListener('visibilitychange', handleVisibility);
        };
    }, []);

    return (
        <div className="webcam-preview">
            <video ref={videoRef} autoPlay playsInline muted className="webcam-video"></video>
            {!loaded && <div className="loading-overlay">Waking up AI...</div>}
            {errorMsg && <div className="loading-overlay" style={{ background: 'rgba(255,0,0,0.8)', zIndex: 9999 }}>{errorMsg}</div>}
        </div>
    );
}
