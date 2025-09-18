import Header from "@/components/header";
import { Outlet } from "react-router-dom";

export default function LearnerLayout() {
  return (
    <div>
      {/* Header */}
      <Header />

      {/* Page Content */}
      <main className="">
        <Outlet /> {/* This is where child routes will render */}
      </main>
    </div>
  );
}
