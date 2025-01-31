import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";

const App = () => {
  const [versionA, setVersionA] = useState(null);
  const [versionB, setVersionB] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [numTeachers, setNumTeachers] = useState(0);

  const handleFileChange = (e, setter) => {
    setter(e.target.files[0]);
  };

  const handleTeacherChange = (index, field, value) => {
    const updatedTeachers = [...teachers];
    updatedTeachers[index] = { ...updatedTeachers[index], [field]: value };
    setTeachers(updatedTeachers);
  };

  const generatePDF = async () => {
    if (!versionA || !versionB || teachers.length === 0) return;

    const mergedPdf = await PDFDocument.create();
    const versionABytes = await versionA.arrayBuffer();
    const versionBBytes = await versionB.arrayBuffer();
    const versionADoc = await PDFDocument.load(versionABytes);
    const versionBDoc = await PDFDocument.load(versionBBytes);

    for (const teacher of teachers) {
      const { name, versionAAmount, versionBAmount } = teacher;

      const page = mergedPdf.addPage();
      page.drawText(`${name}`, { x: 50, y: 750, size: 20 });

      const startAPage = mergedPdf.addPage();
      startAPage.drawText("START VERSION A", { x: 50, y: 750, size: 20 });

      for (let i = 0; i < versionAAmount; i++) {
        const copiedPages = await mergedPdf.copyPages(versionADoc, [0]);
        mergedPdf.addPage(copiedPages[0]);
      }

      const startBPage = mergedPdf.addPage();
      startBPage.drawText("START VERSION B", { x: 50, y: 750, size: 20 });

      for (let i = 0; i < versionBAmount; i++) {
        const copiedPages = await mergedPdf.copyPages(versionBDoc, [0]);
        mergedPdf.addPage(copiedPages[0]);
      }
    }

    const pdfBytes = await mergedPdf.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "merged.pdf";
    link.click();
  };

  return (
    <div className="w-full  p-10">
      <div className="p-6 max-w-3xl mx-auto bg-gray-100 shadow-md rounded-lg">
        <h2 className="text-2xl font-bold text-center mb-4">Test Creator</h2>

        <div className="bg-orange-300 p-2 rounded-md">
          <p className="mt-1">
            This app leaves a 'SEPERATOR' page and makes 1 big pdf that can be printed easily at print center and sorted quickly
          </p>
          <p className="mb-1">
            -Shrey
          </p >
        </div>

        <div className="space-y-4 mt-5">
          <div>
            <label className="block font-medium">Upload Version A</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => handleFileChange(e, setVersionA)}
              className="w-full border rounded p-2"
            />
          </div>

          <div>
            <label className="block font-medium">Upload Version B</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => handleFileChange(e, setVersionB)}
              className="w-full border rounded p-2"
            />
          </div>

          <div>
            <label className="block font-medium">Number of Teachers</label>
            <input
              type="number"
              min="1"
              onChange={(e) => setNumTeachers(Number(e.target.value))}
              className="w-full border rounded p-2"
            />
          </div>

          {Array.from({ length: numTeachers }).map((_, i) => (
            <div key={i} className="p-4 border rounded mt-2 bg-white">
              <h3 className="font-semibold mb-2">Teacher {i + 1}</h3>
              <label className="block">Name</label>
              <input
                type="text"
                onChange={(e) => handleTeacherChange(i, "name", e.target.value)}
                className="w-full border rounded p-2 mb-2"
              />

              <label className="block"># of Version A Tests</label>
              <input
                type="number"
                min="0"
                onChange={(e) => handleTeacherChange(i, "versionAAmount", Number(e.target.value))}
                className="w-full border rounded p-2 mb-2"
              />

              <label className="block"># of Version B Tests</label>
              <input
                type="number"
                min="0"
                onChange={(e) => handleTeacherChange(i, "versionBAmount", Number(e.target.value))}
                className="w-full border rounded p-2"
              />
            </div>
          ))}

          <button
            onClick={generatePDF}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
          >
            Generate PDF
          </button>
        </div>
      </div></div>

  );
};

export default App;
