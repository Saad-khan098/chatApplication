import React, { useState } from "react";
import { Link } from "react-router-dom";
import styles from './Landing.module.scss'
import logo from '../../assets/images/logo.png'
import SignupForm from "./Signup";
import LoginForm from "./Login";


export default function Landing() {


    const [authPopup, setAuthPopup] = useState<null | 'signup' | 'login'>(null);;

    function closeAuthPopup(): void {
        setAuthPopup(null)
    }



    return (
        <main>

            {authPopup === 'signup' && (
                <div className={styles.popupOverlay}>
                    <div className={styles.popupContent}>
                        <SignupForm close={closeAuthPopup} />
                    </div>
                </div>
            )}            
            {authPopup === 'login' && (
                <div className={styles.popupOverlay}>
                    <div className={styles.popupContent}>
                        <LoginForm close={closeAuthPopup} />
                    </div>
                </div>
            )}            
            <nav>
                <div className={styles.content}>
                    <div className={styles.logo}>
                        <h2>Pulse</h2>
                        <img src={logo} alt="Logo" />
                    </div>
                    <div className={styles.links}>
                        {/* <Link to="/">Home</Link> | <Link to="/login">Login</Link> */}
                        <a href="#">Privacy</a>
                        <a href="#">Privacy</a>
                        <a href="#">Privacy</a>
                        <a href="#">Privacy</a>
                        <a href="#" className={styles.butt}>Try Pulse</a>
                    </div>
                </div>
            </nav>

            <section className={styles.section1}>
                <div className={styles.left}>
                    <h1>Communicate Anywhere <br></br> Anytime</h1>
                    <p>Connect effortlessly across all devices with Pulse. Break free from limitations and redefine communication, anytime, anywhere.</p>
                    <div className={styles.authButtons}>
                        <Link to="#" onClick={() => { setAuthPopup('signup') }} className={styles.filled}>Signup</Link>
                        <Link to="#" onClick={() => { setAuthPopup('login') }} className={styles.outline}>Login</Link>
                    </div>
                </div>
                <div className={styles.right}>

                </div>
            </section>
        </main>
    );
}