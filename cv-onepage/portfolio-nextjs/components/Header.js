import Link from 'next/link';

export default function Header() {
  return (
    <header className="top">
      <Link className="brand" href="/">Meryem Elheni</Link>
      <nav>
        <Link href="/#about">About</Link>
        <Link href="/#skills">Skills</Link>
        <Link href="/#devsecops">DevSecOps</Link>
        <Link href="/projects">Projects</Link>
        <Link href="/#experience">Experience</Link>
        <Link href="/#contact">Contact</Link>
      </nav>
    </header>
  );
}
