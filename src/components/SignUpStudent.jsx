import React, { useState } from "react";
import "../style/signup.css";
import { useNavigate } from "react-router-dom";
import { register } from "./api/API.js";

export const SignUpStudent = () => {
    const navigate = useNavigate();
    const [firstname, setFirstName] = useState("");
    const [lastname, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [student_num, setStudentNum] = useState("");
    const [program, setProgram] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleSignUp = async (e) => {
        e.preventDefault();

        if (!email.endsWith("@neu.edu.ph")) {
            alert("Invalid email format! Use '@neu.edu.ph'.");
            return;
        }

        if (!/^\d{2}-\d{5}-\d{3}$/.test(student_num)) {
            alert("Invalid Student Number format! Example: 21-12345-678");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        try {
            const response = await register(firstname, lastname, email, student_num, program, password);
            console.log("API Response:", response);

            if (response.access_token) {
                alert("Registration successful!");
                navigate("/signin");
            } else {
                alert(response.message || "Registration unsuccessful. Please try again.");
            }
        } catch (error) {
            console.error("Registration error:", error);
            alert("An error occurred. Please try again.");
        }
    };

    return (
        <div className="container-fluid vh-100 d-flex p-0">
            <div className="col-md-7 d-none d-md-block p-0">
                <img src="/src/assets/univ.png" alt="University" className="w-100 h-100" style={{ objectFit: "cover" }} />
            </div>

            <div className="col-md-5 d-flex align-items-center justify-content-center">
                <div className="form-container">
                    <div className="d-flex justify-content-center">
                        <img src="/src/assets/HANR_LOGO-4.png" alt="University" className="w-50 h-50" />
                    </div>

                    <h3 className="text-center mb-3">Student Sign Up</h3>

                    <form className="signup-form" onSubmit={handleSignUp}>
                        <div className="form-group">
                            <label htmlFor="firstname">First Name</label>
                            <input type="text" id="firstname" className="form-control" placeholder="ex. Angelica Mae" required value={firstname} onChange={(e) => setFirstName(e.target.value)} />
                        </div>

                        <div className="form-group">
                            <label htmlFor="lastname">Last Name</label>
                            <input type="text" id="lastname" className="form-control" placeholder="ex. Manliguez" required value={lastname} onChange={(e) => setLastName(e.target.value)} />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">NEU Email</label>
                            <input type="email" id="email" className="form-control" placeholder="user@neu.edu.ph" required value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>

                        <div className="form-group">
                            <label htmlFor="student_num">Student Number</label>
                            <input type="text" id="student_num" className="form-control" placeholder="ex. 21-12345-678" required value={student_num} onChange={(e) => setStudentNum(e.target.value)} />
                        </div>

                        <div className="form-group">
                            <label htmlFor="program">Program</label>
                            <select id="program" className="form-control" required value={program} onChange={(e) => setProgram(e.target.value)}>
                                <option value="">Select Program</option>
                                <option value="BSCS">BSCS</option>
                                <option value="BSIT">BSIT</option>
                                <option value="BSEMC">BSEMC</option>
                                <option value="BSIS">BSIS</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input type="password" id="password" className="form-control" placeholder="*********" required value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input type="password" id="confirmPassword" className="form-control" placeholder="*********" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                        </div>

                        <button type="submit" className="w-100 custom-button">Sign Up</button>

                        <p className="text-center mt-3">
                            Already have an account? <a href="#" onClick={() => navigate("/signin")}>Sign In</a>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};