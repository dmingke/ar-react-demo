// src/ARViewer.jsx
import React, { useEffect, useRef } from "react";
 // model-viewer 的 CDN 地址
// 引入 model-viewer 的 JS（只需引入一次，可放在 public/index.html 里）


export default function ARViewer() {
  const videoRef = useRef(null);
  const modelViewerRef = useRef(null);
  let longPressTimer = useRef(null);
  let isLongPress = useRef(false);

  useEffect(() => {

    // 优先尝试后置摄像头
    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: { exact: "environment" } },
      })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(() => {
        // 如果没有后置摄像头，降级为前置摄像头
        navigator.mediaDevices
          .getUserMedia({
            video: { facingMode: "user" },
          })
          .then((stream) => {
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
          })
          .catch((err) => {
            // 依然失败，提示用户
            console.warn("无法访问摄像头:", err);
          });
      });
  }, []);

  // 按压事件逻辑
  useEffect(() => {
    const modelViewer = modelViewerRef.current;
    if (!modelViewer) return;

    const changeModel = (modelName) => {
      modelViewer.setAttribute("src", `/${modelName}.glb`);
    };

    const handlePointerDown = () => {
      isLongPress.current = false;
      longPressTimer.current = setTimeout(() => {
        isLongPress.current = true;
        changeModel("base_basic_shaded_run");
      }, 500);
    };

    const handlePointerUp = () => {
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
      if (!isLongPress.current) {
        changeModel("base_basic_shaded_idle");
      } else {
        changeModel("base_basic_shaded");
      }
    };

    // 判断是否为移动端
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      modelViewer.addEventListener("touchstart", handlePointerDown);
      modelViewer.addEventListener("touchend", handlePointerUp);
    } else {
      modelViewer.addEventListener("pointerdown", handlePointerDown);
      modelViewer.addEventListener("pointerup", handlePointerUp);
    }

    return () => {
      if (isMobile) {
        modelViewer.removeEventListener("touchstart", handlePointerDown);
        modelViewer.removeEventListener("touchend", handlePointerUp);
      } else {
        modelViewer.removeEventListener("pointerdown", handlePointerDown);
        modelViewer.removeEventListener("pointerup", handlePointerUp);
      }
    };
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* 摄像头背景 */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          position: "absolute",
          width: "100vw",
          height: "100vh",
          objectFit: "cover",
          zIndex: 1,
        }}
      />
      {/* 3D 模型 */}
      <model-viewer
        ref={modelViewerRef}
        id="arModel"
        src="/base_basic_shaded.glb"
        ios-src="/base_basic_shaded_idle.usdz"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 2,
          background: "transparent",
        }}
        camera-controls
        autoPlay
        shadow-intensity="1"
        interaction-prompt="none"
        background-color="transparent"
      ></model-viewer>
    </div>
  );
}
