import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Header from '../components/Header';

describe('Portfolio Next.js', () => {
    test('le Header affiche le nom Meryem Elheni', () => {
        render(<Header />);
        expect(screen.getByText('Meryem Elheni')).toBeInTheDocument();
    });
});