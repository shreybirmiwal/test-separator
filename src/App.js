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
    <div className="p-6 max-w-lg mx-auto">
      <label>PDF: Version A upload</label>
      <input type="file" accept="application/pdf" onChange={(e) => handleFileChange(e, setVersionA)} />

      <label>PDF: Version B upload</label>
      <input type="file" accept="application/pdf" onChange={(e) => handleFileChange(e, setVersionB)} />

      <label># of Teachers</label>
      <input type="number" min="1" onChange={(e) => setNumTeachers(Number(e.target.value))} />

      {Array.from({ length: numTeachers }).map((_, i) => (
        <div key={i} className="p-2 border rounded mt-2">
          <label>Teacher {i + 1} Name</label>
          <input type="text" onChange={(e) => handleTeacherChange(i, "name", e.target.value)} />

          <label># of Version A tests</label>
          <input type="number" min="0" onChange={(e) => handleTeacherChange(i, "versionAAmount", Number(e.target.value))} />

          <label># of Version B tests</label>
          <input type="number" min="0" onChange={(e) => handleTeacherChange(i, "versionBAmount", Number(e.target.value))} />
        </div>
      ))}

      <div className="mt-4 p-2 bg-blue-500 text-white text-center cursor-pointer" onClick={generatePDF}>Generate PDF</div>
    </div>
  );
};

export default App;
