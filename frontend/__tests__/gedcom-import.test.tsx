import { render, screen } from "@testing-library/react";
import GedcomImport from "@/components/gedcom/GedcomImport";

describe("GedcomImport", () => {
  it("renders import form heading", () => {
    render(<GedcomImport />);
    const headings = screen.getAllByRole("heading", { name: /Import a GEDCOM file/i });
    expect(headings.length).toBeGreaterThan(0);
  });

  it("Continue button is disabled when no file is selected", () => {
    render(<GedcomImport />);
    expect(screen.getByRole("button", { name: /continue/i })).toBeDisabled();
  });

  it("shows drop zone for drag and drop", () => {
    render(<GedcomImport />);
    expect(screen.getByText(/Drag and drop/i)).toBeInTheDocument();
  });

  it("shows warning message about replacing data", () => {
    render(<GedcomImport />);
    expect(screen.getByText(/delete all the genealogy data/i)).toBeInTheDocument();
  });

  it("shows import preferences section", () => {
    render(<GedcomImport />);
    expect(screen.getByText(/Import preferences/i)).toBeInTheDocument();
  });
});
