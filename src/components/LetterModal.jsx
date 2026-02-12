import React, { useState } from 'react';
import { Heart, X, MailOpen } from 'lucide-react';

export default function LetterModal({ onClose }) {
    const [isOpen, setIsOpen] = useState(false);

    const handleOpen = () => {
        setIsOpen(true);
    };

    if (!isOpen) {
        return (
            <div className="letter-overlay">
                <div className="envelope-container" onClick={handleOpen}>
                    <div className="envelope">
                        <div className="envelope-flap"></div>
                        <div className="envelope-pocket"></div>
                        <div className="heart-seal">
                            <Heart fill="#FF1493" color="#FF1493" size={40} />
                        </div>
                    </div>
                    <p className="open-text">You have a letter ❤️</p>
                </div>
            </div>
        );
    }

    return (
        <div className="letter-overlay open">
            <div className="letter-content-container">
                <button className="close-btn" onClick={onClose}>
                    <X size={24} color="white" />
                </button>

                <div className="letter-scroll">
                    <h2 className="letter-greeting">HI BEBE ❤️</h2>

                    <p className="letter-text">
                        Happy valentines day yaaa, ini valentine kita yang kedua btw semoga valentine berikutnya kita masih bisa rayain sama sama ya.
                    </p>

                    <p className="letter-text">
                        Im so happy and excited bikin ini buat kamu, ya walaupun aku tau kita lagi ga baik baik aja, tapi itu ga ngurangin semangat aku buat siapin gift ini for you bebe, i hope you like this.
                    </p>

                    <p className="letter-text">
                        Tbh aku kangen banget sama kamu udah hampir sebulan kita break, sedih banget rasanya selama kita break ya walaupun ini demi kebaikan dan keberlanjutan kita juga kedepannya supaya bisa bareng terus.
                    </p>

                    <p className="letter-text">
                        Dan selama break aku cukup banyak belajar untuk jadi lebih dewasa dan aku belajar buat bener bener percaya sepenuhnya ke kamu, gamau lagi ovt gajelas gamau lagi nethink gajelas, karena kalo aku bilang percaya sama kamu tapi masih ovt, masih nethink buat apa aku bilang percaya sama kamu kalo ujung ujungnya masih nethink dan karna hal itu kita jadi berantem terus, im so sorry for that.
                    </p>

                    <p className="letter-text">
                        So sekarang aku bener bener percaya sama kamu bebe, rasa sayang aku ke kamu ga pernah berkurang bebe, aku harap kamu suka gift dari pacar kamu yang ganteng teng teng teng ini hehehehe.
                    </p>

                    <p className="letter-text highlight">
                        I LOVE U FOREVER I MISS U SO BAD, we can go back normal again please....?
                    </p>

                    <div className="letter-footer">
                        <Heart size={30} fill="#FF1493" color="#FF1493" className="pulse-fast" />
                    </div>
                </div>
            </div>
        </div>
    );
}
