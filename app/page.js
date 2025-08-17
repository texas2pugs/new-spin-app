import fs from "fs";
import path from "path";
import ReleaseTable from "../components/ReleaseTable";

export default function Home() {
  // Path to the JSON in public/
  const filePath = path.join(process.cwd(), "public", "final_releases.json");
  const fileContents = fs.readFileSync(filePath, "utf8");
  const releases = JSON.parse(fileContents);

  return (
    <main className="min-h-screen bg-black text-white">
      <ReleaseTable releases={releases} />
    </main>
  );
}
