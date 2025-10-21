export function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) {
    alert("내보낼 데이터가 없습니다")
    return
  }

  // Get headers from first object
  const headers = Object.keys(data[0])

  // Create CSV content
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header]
          // Escape commas and quotes
          if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value
        })
        .join(","),
    ),
  ].join("\n")

  // Add BOM for Excel UTF-8 support
  const BOM = "\uFEFF"
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" })

  // Create download link
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", `${filename}.csv`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function exportToJSON(data: any[], filename: string) {
  if (data.length === 0) {
    alert("내보낼 데이터가 없습니다")
    return
  }

  const jsonContent = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonContent], { type: "application/json" })

  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", `${filename}.json`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
