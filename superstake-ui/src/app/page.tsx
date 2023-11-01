"use client";

import FloatingUI from "../components/FloatingUI";
import HeaderSection from "../components/HeaderSection";
import StatusBar from "../components/StatusBar";
import StyledToastContainer from "../components/StyledToastContainer";
import VaultPageContent from "../components/VaultPage/VaultPageContent";

export default function Home() {
  console.log("Welcome to superstakesol");
  return (
    <>
      <HeaderSection />
      <VaultPageContent />
      <StatusBar />
      <FloatingUI />
      <StyledToastContainer />
    </>
  );
}
