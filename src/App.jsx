import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute.jsx"; // Import fixed component

import { HomeComponents } from "./components/HomeComponent";
import { SignInComponent } from "./components/SignInComponent";
import { SignUpComponent } from "./components/SignUpComponent"; // New selection component
import { SignUpStudent } from "./components/SignUpStudent"; // Student-specific signup
import { SignUpTeacher } from "./components/SignUpTeacher"; // Teacher-specific signup
import NotFound from "./components/NotFound"; // ✅ Import the 404 NotFound component

// Student Components
import { PlaygroundComponent } from "./components/student/PlaygroundComponent";
import { DashboardComponent } from "./components/student/DashboardComponent";
import { ClassManagementComponent } from "./components/student/ClassManagementComponent";
import { CodingAssessmentComponent } from "./components/student/CodingAssessmentComponent";
import { ProfileComponent } from "./components/student/ProfileComponent";

// Teacher Components
import { DashboardComponent as TeacherDashboard } from "./components/teacher/DashboardComponent";
import { PlaygroundComponent as TeacherPlayground } from "./components/teacher/PlaygroundComponent";
import { ProfileComponent as TeacherProfile } from "./components/teacher/ProfileComponent";
import ActivitySettingsComponent from "./components/teacher/ActivitySettingsComponent";
import ActivityItemsComponent from "./components/teacher/ActivityItemsComponent";
import LeaderboardComponent from "./components/teacher/LeaderboardComponent";
import ClassRecord from "./components/teacher/CMClassRecordComponent";
import { CMActivitiesComponent } from "./components/teacher/CMActivitiesComponent";
import { CMBulletinComponent } from "./components/teacher/CMBulletinComponent";
import { TCHRCodingAssessmentComponent } from "./components/teacher/TCHRCodingAssessmentComponent";
import { CreateActivityComponent } from "./components/teacher/AMCreateNewActivityComponent";

function App() {
    return (
        <Router>
            <Routes>

                {/* Public Routes */}
                <Route path="/" element={<HomeComponents />} />
                <Route path="/home" element={<HomeComponents />} />
                <Route path="/signin" element={<SignInComponent />} />
                <Route path="/signup" element={<SignUpComponent />} />  {/* Role selection */}
                <Route path="/signup/student" element={<SignUpStudent />} /> {/* Student Signup */}
                <Route path="/signup/teacher" element={<SignUpTeacher />} /> {/* Teacher Signup */}

                {/* Protected Student Routes */}
                <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
                    <Route path="/student/dashboard" element={<DashboardComponent />} />
                    <Route path="/student/sandbox" element={<PlaygroundComponent />} />
                    <Route path="/student/profile" element={<ProfileComponent />} />
                    <Route path="/student/class" element={<ClassManagementComponent />} />
                    <Route path="/student/assessment" element={<CodingAssessmentComponent />} />
                </Route>

                {/* Protected Teacher Routes */}
                <Route element={<ProtectedRoute allowedRoles={["teacher"]} />}>
                    <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
                    <Route path="/teacher/sandbox" element={<TeacherPlayground />} />
                    <Route path="/teacher/profile" element={<TeacherProfile />} />
                    <Route path="/leaderboard" element={<LeaderboardComponent />} />
                    <Route path="/items" element={<ActivityItemsComponent />} />
                    <Route path="/settings" element={<ActivitySettingsComponent />} />
                    <Route path="/classrecord" element={<ClassRecord />} />
                    <Route path="/activities" element={<CMActivitiesComponent />} />
                    <Route path="/teacher-bulletin" element={<CMBulletinComponent />} />
                    <Route path="/tchr-coding-assessment" element={<TCHRCodingAssessmentComponent />} />
                    <Route path="/create-new-activity" element={<CreateActivityComponent />} />
                </Route>

                {/* 🔥 Fallback route for 404 */}
                <Route path="*" element={<NotFound />} />

            </Routes>
        </Router>
    );
}

export default App;