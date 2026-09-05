"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { generateRoadmap } from "@/services/aiService";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function RoadmapGenerator() {
  const router = useRouter();

  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!goal.trim()) {
      setError("Please enter a goal");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await generateRoadmap({
        goal,
      });

      router.push("/roadmap");
    } catch (err) {
      console.error(err);
      setError("Failed to generate roadmap");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardContent className="space-y-6 pt-6">
          <div>
            <h1 className="text-3xl font-bold">
              Generate AI Roadmap
            </h1>

            <p className="text-muted-foreground mt-2">
              Enter your career goal or skill you want to learn.
              ThiranX AI will generate a personalized roadmap
              and automatically save it.
            </p>
          </div>

          <Input
            placeholder="Java Backend Developer"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            disabled={loading}
          />

          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full"
          >
            {loading
              ? "Generating Roadmap..."
              : "Generate Roadmap"}
          </Button>

          {loading && (
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Analyzing your goal...</p>
              <p>Generating roadmap with AI...</p>
              <p>Saving roadmap and tasks...</p>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-500">
              {error}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}