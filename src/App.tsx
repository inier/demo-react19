import { Routes, Route, NavLink } from "react-router";
import pageLoader from "./component/PageLoader";
import Home from "@/view/Home/index";
import "./App.css";

const TaskApp = pageLoader(() => import("@/view/Task/index"));
const Demo = pageLoader(() => import("@/view/Demo/index"));

const App = () => {
  return (
    <div className="app">
      <main className="content">
        <Routes>
          <Route path="/" index element={<Home />} />
          <Route path="/task" element={<TaskApp />} />
          <Route path="/demo" element={<Demo />} />
        </Routes>
      </main>
      <nav>
        <NavLink to="/" end>
          Home
        </NavLink>
        <NavLink to="/task" end>
          Task
        </NavLink>
        <NavLink to="/demo" end>
          Demo
        </NavLink>
      </nav>
    </div>
  );
};

export default App;
