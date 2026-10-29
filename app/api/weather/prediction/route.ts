
import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";

export async function GET() {
  try {
    const filePath = path.join(
      process.cwd(),
      "ml-model",
      "model_results.json"
    );

    const fileContents = await readFile(filePath, "utf-8");
    const prediction = JSON.parse(fileContents);

    return NextResponse.json(prediction);
  } catch {
    return NextResponse.json(
      { error: "Prediction is not available. Train the model first." },
      { status: 500 }
    );
  }
}
