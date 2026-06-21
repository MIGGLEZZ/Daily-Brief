export const metadata = {
  title: "Daily Brief · MIGGZ",
  description: "Your daily command centre",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: "#0D0F14" }}>
        {children}
      </body>
    </html>
  );
}
