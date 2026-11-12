import { render, screen } from "@testing-library/react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";

describe("Affichage du titre « Ma Garderie »", () => {
  test("la Navbar affiche le nom « Ma Garderie »", () => {
    render(<Navbar />);
    expect(screen.getByText("Ma Garderie")).toBeInTheDocument();
  });

  test("le Hero affiche le titre « Bienvenue à Ma Garderie »", () => {
    render(<Hero garderie={null} />);
    expect(
      screen.getByRole("heading", { level: 1, name: /Ma Garderie/ })
    ).toBeInTheDocument();
  });
});
