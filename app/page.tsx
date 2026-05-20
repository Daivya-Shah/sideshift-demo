export default async function HomePage() {
  return (
    <main style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      <iframe
        title="SideShift App"
        src="/legacy"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          display: "block",
          background: "#f4f4f5"
        }}
      />
    </main>
  );
}
