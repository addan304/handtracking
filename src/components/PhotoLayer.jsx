import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useHand } from '../context/HandContext';

export default function PhotoLayer({ onHandCountChange, onOpennessChange }) {
    const handState = useHand();
    const lastCount = useRef(0);
    const lastOpen = useRef(false);

    const framesSinceChange = useRef(0);
    const pendingCount = useRef(0);
    const pendingOpen = useRef(false);

    useFrame(() => {
        const { handCount, isOpen, isDetected } = handState.current;

        // AGGRESSIVE RESET: If no hand is detected OR count is 0, stop immediately!
        // This prevents Vortex from getting "stuck" when hands are removed quickly.
        if (!isDetected || handCount === 0) {
            if (lastCount.current !== 0) {
                lastCount.current = 0;
                onHandCountChange(0);
            }
            if (lastOpen.current !== false) {
                lastOpen.current = false;
                onOpennessChange(false);
            }
            framesSinceChange.current = 0;
            pendingCount.current = 0;
            return;
        }

        // Stability logic for switching BETWEEN gestures (e.g. Fist -> Palm)
        // We still need a tiny bit of smoothing here to prevent flickering.
        if (handCount !== pendingCount.current || isOpen !== pendingOpen.current) {
            pendingCount.current = handCount;
            pendingOpen.current = isOpen;
            framesSinceChange.current = 0;
        } else {
            framesSinceChange.current++;
        }

        // Only commit the change if it's stable for 3 frames
        if (framesSinceChange.current >= 3) {
            if (pendingCount.current !== lastCount.current) {
                lastCount.current = pendingCount.current;
                onHandCountChange(lastCount.current);
            }
            if (pendingOpen.current !== lastOpen.current) {
                lastOpen.current = pendingOpen.current;
                onOpennessChange(lastOpen.current);
            }
        }
    });

    return null;
}
