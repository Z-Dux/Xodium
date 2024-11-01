//Fix the script in the following code.  Analyse the needs and make the websocket sync with the disconnect button. Have the code made into needed functions and make sure to call them whenever needed only

import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import React, { useState } from "react";
import { useEffect, useRef, useCallback } from "react";

import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowDown, ArrowUp } from "lucide-react";

import { Power, Wifi } from "lucide-react";
import { Lock, Unlock } from "lucide-react";
export default function Component() {
  const [frontClawPower, setFrontClawPower] = useState(false);
  const [topClawPower, setTopClawPower] = useState(false);
  const [mainPower, setMainPower] = useState(false);
  const [websocketConnected, setWebsocketConnected] = useState(false);

  const [frontClawOpenClose, setFrontClawOpenClose] = useState(105);
  const [frontClawUpDown, setFrontClawUpDown] = useState(90);
  const [frontClawLeftRight, setFrontClawLeftRight] = useState(140);
  const [frontClawLockPosition, setFrontClawLockPosition] = useState(false);

  const [topClawOpenClose, setTopClawOpenClose] = useState(25);
  const [topClawUpDown, setTopClawUpDown] = useState(110);
  const [topClawLeftRight, setTopClawLeftRight] = useState(55);
  const [topClawLockPosition, setTopClawLockPosition] = useState(false);

  const [scrollLocked, setScrollLocked] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(false);
  const [angle, setAngle] = useState(0);
  const [speed, setSpeed] = useState(0);
  const joystickRef = useRef<HTMLDivElement>(null);
  const socket = useRef<WebSocket | null>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [isPoweredOn, setIsPoweredOn] = useState(false);

  const controls = {
    f: {
      oc: frontClawOpenClose,
      ud: frontClawUpDown,
      lr: frontClawLeftRight,
      lp: frontClawLockPosition,
    },
    t: {
      oc: topClawOpenClose,
      up: topClawUpDown,
      lr: topClawLeftRight,
      lp: topClawLockPosition,
    },
    j: {
      d: angle,
      s: speed,
      a: active,
    },
    p: 0, //pulley
    a: 0, //acutator
    m: mainPower, //power bool
  };
  const connectWebSocket = useCallback(() => {
    if (!isConnected) {
      socket.current = new WebSocket(`ws://192.168.4.1:81`);
      socket.current.onopen = () => {
        console.log("WebSocket connected");
        setIsConnected(true);
      };
      socket.current.onclose = () => {
        console.log("WebSocket disconnected");
        setIsConnected(false);
      };
      socket.current.onmessage = (event) => {
        console.log("Received from ESP32:", event.data);
      };
    } else {
      socket.current?.close();
      setIsConnected(false);
    }
  }, [isConnected]);

  const sendMessage = useCallback((message: string) => {
    if (socket.current?.readyState === WebSocket.OPEN) {
      socket.current.send(message);
    } else {
      console.log("WebSocket not open");
    }
  }, []);

  const transmitData = useCallback(() => {
    let data = JSON.stringify(controls, null, 2);
    console.log(data);
    sendMessage(data);
  }, [controls, sendMessage]);

  useEffect(() => {
    const intervalId = setInterval(transmitData, 500); // Increased frequency for smoother updates

    return () => {
      clearInterval(intervalId);
    };
  }, [transmitData]);

  useEffect(() => {
    const handleMove = (clientX: number, clientY: number) => {
      if (joystickRef.current && active) {
        const rect = joystickRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const maxDistance = rect.width / 2;

        let dx = clientX - centerX;
        let dy = clientY - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > maxDistance) {
          dx = (dx / distance) * maxDistance;
          dy = (dy / distance) * maxDistance;
        }

        const normalizedX = dx / maxDistance;
        const normalizedY = dy / maxDistance;

        setPosition({ x: normalizedX, y: normalizedY });

        let calculatedAngle =
          Math.atan2(-normalizedX, -normalizedY) * (180 / Math.PI);
        if (calculatedAngle < 0) calculatedAngle += 360;
        setAngle(Math.round(calculatedAngle));

        setSpeed(
          Math.round(
            Math.sqrt(normalizedX * normalizedX + normalizedY * normalizedY) *
              100
          )
        );
        transmitData();
      }
    };

    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleEnd = () => {
      setActive(false);
      setPosition({ x: 0, y: 0 });
      setAngle(0);
      setSpeed(0);
      transmitData(); // Ensure final position is transmitted
    };

    if (active) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("mouseup", handleEnd);
      window.addEventListener("touchend", handleEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchend", handleEnd);
    };
  }, [active, transmitData]);

  useEffect(() => {
    const preventDefault = (e: Event) => {
      e.preventDefault();
    };

    if (scrollLocked) {
      document.body.style.overflow = "hidden";
      document.addEventListener("touchmove", preventDefault, {
        passive: false,
      });
      document.addEventListener("wheel", preventDefault, { passive: false });
    } else {
      document.body.style.overflow = "";
      document.removeEventListener("touchmove", preventDefault);
      document.removeEventListener("wheel", preventDefault);
    }

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("touchmove", preventDefault);
      document.removeEventListener("wheel", preventDefault);
    };
  }, [scrollLocked]);

  const toggleScrollLock = () => {
    setScrollLocked(!scrollLocked);
  };

  const handleReel = (device: "p" | "a", direction: "in" | "out" | "stop") => {
    controls[device] = direction === "in" ? 1 : direction === "out" ? -1 : 0;
  };

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startReeling = (device: "p" | "a", direction: "in" | "out") => {
    intervalRef.current = setInterval(() => handleReel(device, direction), 100);
  };

  const stopReeling = (device: "p" | "a") => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    handleReel(device, "stop");
  };

  return (
    <div className="min-h-screen bg-neutrak-900 text-neutral-200 p-6 rounded-lg max-w-full mx-auto">
      <h1 className="text-5xl font-heading text-center mb-3 font-'Lilita One'">
        Crused
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
        {/* Front Claw */}
        <div className="border border-neutral-700 p-6 rounded-lg shadow-lg col-span-1">
          <h2 className="text-2xl font-subheading mb-4">Front Claw</h2>
          <div className="flex items-center justify-between mb-4">
            <span className="font-body">Power</span>
            <Power
              onClick={() => setFrontClawPower(!frontClawPower)}
              className={`h-8 w-8 cursor-pointer ${
                frontClawPower ? "text-green-500" : "text-red-500"
              }`}
            />
          </div>
          <div className="space-y-4 font-body">
            {[
              {
                label: "Open/Close",
                value: frontClawOpenClose,
                setValue: setFrontClawOpenClose,
              },
              {
                label: "Up/Down",
                value: frontClawUpDown,
                setValue: setFrontClawUpDown,
              },
              {
                label: "Left/Right",
                value: frontClawLeftRight,
                setValue: setFrontClawLeftRight,
              },
            ].map(({ label, value, setValue }) => (
              <div key={label}>
                <span className="block mb-2">{label}</span>
                <div className="flex items-center">
                  <Slider
                    value={[value]}
                    onValueChange={(newValue) => setValue(newValue[0])}
                    max={180}
                    step={1}
                    className="[&_[role=slider]]:bg-slate-450"
                  />
                  <span className="text-sm text-neutral-400 ml-3">
                    {value}/180
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="font-body">
              <b>Lock Position</b>
            </span>
            <Switch
              checked={frontClawLockPosition}
              onCheckedChange={setFrontClawLockPosition}
              className={
                frontClawLockPosition ? "bg-neutral-400" : "bg-neutral-600"
              }
            />
          </div>
        </div>
        {/* Top Claw */}
        <div className="border border-neutral-700 p-4 rounded-lg ml-0 col-span-1">
          <h2 className="text-2xl font-subheading mb-4">Top Claw</h2>
          <div className="flex items-center justify-between mb-4">
            <span className="font-body">Power</span>
            <Power
              onClick={() => setTopClawPower(!topClawPower)}
              className={`h-8 w-8 cursor-pointer ${
                topClawPower ? "text-green-500" : "text-red-500"
              }`}
            />
          </div>
          <div className="space-y-4 font-body">
            {[
              {
                label: "Open/Close",
                value: topClawOpenClose,
                setValue: setTopClawOpenClose,
              },
              {
                label: "Up/Down",
                value: topClawUpDown,
                setValue: setTopClawUpDown,
              },
              {
                label: "Left/Right",
                value: topClawLeftRight,
                setValue: setTopClawLeftRight,
              },
            ].map(({ label, value, setValue }) => (
              <div key={label}>
                <span className="block mb-2">{label}</span>
                <div className="flex items-center">
                  <Slider
                    value={[value]}
                    onValueChange={(newValue) => setValue(newValue[0])}
                    max={180}
                    step={1}
                    className="[&_[role=slider]]:bg-zinc-200"
                  />
                  <span className="text-sm text-neutral-400 ml-3">
                    {value}/180
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="font-body">Lock Position</span>
            <Switch
              checked={topClawLockPosition}
              onCheckedChange={setTopClawLockPosition}
              className={topClawLockPosition ? "bg-blue-400" : "bg-neutral-600"}
            />
          </div>
        </div>
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-rows-2 mt-[0.1%]">
            <Card className="bg-neutral-950 border-neutral-700 text-white font-body">
              <CardHeader>
                <CardTitle className="font-subheading text-2xl">
                  Linear Actuator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between gap-4">
                  <Button
                    onMouseDown={() => startReeling("a", "in")}
                    onMouseUp={() => stopReeling("a")}
                    onMouseLeave={() => stopReeling("a")}
                    onTouchStart={() => startReeling("a", "in")}
                    onTouchEnd={() => stopReeling("a")}
                    className="flex-1 h-20 text-2xl transition-all duration-200 active:bg-blue-600 active:shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                  >
                    <ArrowUp className="mr-2 h-10 w-10 font-subheading" /> Reel
                    In
                  </Button>
                  <Button
                    onMouseDown={() => startReeling("a", "out")}
                    onMouseUp={() => stopReeling("a")}
                    onMouseLeave={() => stopReeling("a")}
                    onTouchStart={() => startReeling("a", "out")}
                    onTouchEnd={() => stopReeling("a")}
                    className="flex-1 h-20 text-2xl transition-all duration-200 active:bg-blue-600 active:shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                  >
                    <ArrowDown className="mr-2 h-10 w-10" /> Reel Out
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-neutral-950 border-neutral-700 text-body font-body m-0">
              <CardHeader>
                <CardTitle className="font-subheading text-2xl">
                  Pulley System
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between gap-4">
                  <Button
                    onMouseDown={() => startReeling("p", "in")}
                    onMouseUp={() => stopReeling("p")}
                    onMouseLeave={() => stopReeling("p")}
                    onTouchStart={() => startReeling("p", "in")}
                    onTouchEnd={() => stopReeling("p")}
                    className="flex-1 h-20 text-2xl transition-all duration-200 active:bg-blue-600 active:shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                  >
                    <ArrowUp className="mr-2 h-10 w-10" /> Reel In
                  </Button>
                  <Button
                    onMouseDown={() => startReeling("p", "out")}
                    onMouseUp={() => stopReeling("p")}
                    onMouseLeave={() => stopReeling("p")}
                    onTouchStart={() => startReeling("p", "out")}
                    onTouchEnd={() => stopReeling("p")}
                    className="flex-1 h-20 text-2xl transition-all duration-200 active:bg-blue-600 active:shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                  >
                    <ArrowDown className="mr-2 h-10 w-10" /> Reel Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          <Card className="bg-neutral-950 border-neutral-700 text-body font-body">
            <CardHeader>
              <CardTitle className="font-subheading text-2xl">
                Connection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge
                  variant={isConnected ? "default" : "destructive"}
                  className="h-6 px-2 text-sm"
                >
                  {isConnected ? (
                    <>
                      <Wifi className="mr-2 h-4 w-4" />
                      Connected
                    </>
                  ) : (
                    <>
                      <Wifi className="mr-2 h-4 w-4" />
                      Disconnected
                    </>
                  )}
                </Badge>
                <Button
                  variant={isConnected ? "destructive" : "default"}
                  onClick={connectWebSocket}
                >
                  {isConnected ? "Disconnect" : "Connect"}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Power</span>
                <Switch
                  checked={isPoweredOn}
                  onCheckedChange={setIsPoweredOn}
                  disabled={!isConnected}
                />
              </div>
            </CardContent>
          </Card>
          {/* ... (rest of the JSX remains unchanged) */}
        </div>
        {/* Joystick */}
        <div className="border border-neutral-700 p-6 rounded-lg shadow-lg col-span-1">
          <h2 className="text-2xl font-subheading mb-4">Movement</h2>
          <div className="flex flex-col items-center justify-center w-full text-neutral-200">
            <button
              onClick={toggleScrollLock}
              className="font-body mb-4 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-md flex items-center justify-center transition-colors duration-200"
            >
              {scrollLocked ? (
                <>
                  <Unlock className="w-4 h-4 mr-2 font-body" />
                  Unlock Scroll
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2 font-body" />
                  Lock Scroll
                </>
              )}
            </button>
            <div
              ref={joystickRef}
              className="relative w-32 h-32 rounded-full bg-neutral-800 cursor-pointer"
              onMouseDown={() => setActive(true)}
              onTouchStart={() => setActive(true)}
            >
              <div
                className="absolute w-1/2 h-1/2 rounded-full bg-neutral-700 transition-all duration-75 ease-out"
                style={{
                  left: `${50 + position.x * 50}%`,
                  top: `${50 + position.y * 50}%`,
                  transform: "translate(-50%, -50%)",
                }}
              />
            </div>
            <div className="mt-4 text-center">
              <p className="text-lg font-semibold font-body">
                Direction: {angle}°
              </p>
              <p className="text-lg font-semibold font-body">Speed: {speed}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Control Section */}

      {/* Speed & Angle */}
      <div className="mt-4 flex items-center">
        <span className="block mb-2 font-body">Speed</span>
        <Slider
          value={[speed]}
          onValueChange={(newValue) => setSpeed(newValue[0])}
          max={100}
          step={1}
          className="[&_[role=slider]]:bg-zinc-200"
        />
        <span className="text-sm text-neutral-400 ml-3">{speed}/100</span>
      </div>

      <div className="mt-4 flex items-center">
        <span className="block mb-2 font-body">Angle</span>
        <Slider
          value={[angle]}
          onValueChange={(newValue) => setAngle(newValue[0])}
          max={360}
          step={1}
          className="[&_[role=slider]]:bg-zinc-200"
        />
        <span className="text-sm text-neutral-400 ml-3">{angle}/360</span>
      </div>

      {/* Connection Status */}
      <div className="mt-4 flex items-center justify-center">
        <div className="flex items-center">
          {websocketConnected ? (
            <Wifi className="w-8 h-8 text-green-500" />
          ) : (
            <Power className="w-8 h-8 text-red-500" />
          )}
          <span className="ml-2 text-lg">
            {websocketConnected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </div>
    </div>
  );
}
