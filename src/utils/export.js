// xlsx y jspdf pesan ~1 MB juntos y casi nadie exporta, asi que se descargan
// hasta que alguien pulsa el boton (import dinamico), no al abrir la app.

export function todayStamp() {
  return new Date().toISOString().slice(0, 10)
}

// sheets: [{ name, rows: [{ Columna: valor, ... }] }]
export async function exportExcel(filename, sheets) {
  const XLSX = await import('xlsx')
  const wb = XLSX.utils.book_new()
  for (const { name, rows } of sheets) {
    const ws = XLSX.utils.json_to_sheet(rows)
    XLSX.utils.book_append_sheet(wb, ws, name.slice(0, 31))
  }
  XLSX.writeFile(wb, filename)
}

// sections: [{ heading?, columns: [{ header, key }], rows }]
export async function exportPDF({ filename, title, subtitle, sections }) {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ])
  const doc = new jsPDF()
  let y = 16

  doc.setFontSize(14)
  doc.text(title, 14, y)
  y += 6

  if (subtitle) {
    doc.setFontSize(9)
    doc.setTextColor(120)
    doc.text(subtitle, 14, y)
    doc.setTextColor(0)
    y += 6
  }

  for (const section of sections) {
    if (section.heading) {
      doc.setFontSize(11)
      doc.text(section.heading, 14, y + 4)
      y += 10
    }
    autoTable(doc, {
      startY: y,
      head: [section.columns.map(c => c.header)],
      body: section.rows.map(r => section.columns.map(c => r[c.key] ?? '')),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [37, 99, 235] },
      margin: { left: 14, right: 14 },
    })
    y = doc.lastAutoTable.finalY + 10
  }

  doc.save(filename)
}
