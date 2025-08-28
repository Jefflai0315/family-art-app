"use client";

import React from "react";
import Link from "next/link";
import { Camera, Play, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Playing With Pencil
          </h1>
          <p className="text-xl text-gray-600">
            Transform your family photos into magical animated artwork
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Get Outline Flow */}
          <Link href="/getoutline">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-6 rounded-2xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 cursor-pointer">
              <div className="w-16 h-16 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Camera className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Your Outline</h3>
              <p className="text-sm opacity-90 mb-4">
                Upload a family photo and get a printable outline for coloring
              </p>
              <div className="flex items-center justify-center text-sm opacity-80">
                <span>Start Here</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </div>
          </Link>

          {/* Get Animation Flow */}
          <Link href="/getanim">
            <div className="bg-gradient-to-br from-green-500 to-blue-600 text-white p-6 rounded-2xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 cursor-pointer">
              <div className="w-16 h-16 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Play className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Your Animation</h3>
              <p className="text-sm opacity-90 mb-4">
                Submit your finished artwork and bring it to life with animation
              </p>
              <div className="flex items-center justify-center text-sm opacity-80">
                <span>Start Here</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
