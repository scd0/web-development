import React from "react";
import { CgWorkAlt } from "react-icons/cg";
import { FaReact } from "react-icons/fa";
import { LuGraduationCap } from "react-icons/lu";
import supercellImg from "@/public/supercell.png";
import dreamwareImg from "@/public/dreamware.png";
import debuggerImg from "@/public/debugger.png";
import offlineActivisionImg from "@/public/offline-activision.jpg";
import parallelSocialMediaImg from "@/public/parallel-social-media.png";
import pongImg from "@/public/pong.jpeg";

export const links = [
  {
    name: "Accueil",
    hash: "#home",
  },
  {
    name: "Présentation",
    hash: "#about",
  },
  {
    name: "Compétences",
    hash: "#skills",
  },
  {
    name: "Projets",
    hash: "#projects",
  },
  {
    name: "Formation",
    hash: "#experience",
  },
] as const;

export const experiencesData = [
  {
    title: "Lycée",
    location: "Douai, FR",
    description: "Dès mon entrée au lycée, j'ai commencé à apprendre l'informatique en autodidacte.",
    icon: React.createElement(LuGraduationCap),
    date: "2017",
  },
  {
    title: "Université",
    location: "Lille, FR",
    description: "J'ai choisi la spécialité informatique, mais je n'ai pas appris beaucoup de choses là-bas.",
    icon: React.createElement(LuGraduationCap),
    date: "2020 - 2021",
  },
  {
    title: "École 42",
    location: "Paris, FR",
    description: "J'ai apprécié cette école car elle m'a stimulé par des défis et sa méthode d'apprentissage m'a beaucoup enrichi.",
    icon: React.createElement(LuGraduationCap),
    date: "2021 - 2023",
  },
  {
    title: "Autodidacte",
    location: "Lille, FR",
    description: "Tous les jours, je continue à apprendre énormément de choses. Mais aujourd'hui, j'aimerai faire de ma passion un métier.",
    icon: React.createElement(CgWorkAlt),
    date: "2023 - Aujourd'hui",
  },
] as const;

export const projectsData = [
  {
    title: "parallel-social-media",
    description:
      "Développement d'un réseau social full-stack inspiré par Instagram.",
    tags: ["TypeScript", "MERN Stack", "JWT", "Redux", "shadcn", "framer motion", "insomnia"],
    imageUrl: parallelSocialMediaImg,
  },
  {
    title: "dreamware",
    description:
    "Développement de produits digitaux et d'un site e-commerce en freelance dans le domaine du jeu vidéo.",
    tags: ["C++", "DirectX", "LUA", "Python", "IDA Pro", "Next.js"],
    imageUrl: dreamwareImg,
  },
  {
    title: "supercell-reloaded",
    description:
      "Développement de proxies, de serveurs et d'outils afin de modifier entièrement le fonctionnement des jeux développés par Supercell.",
    tags: ["C#", "TCP/IP", "MongoDB", "Python", "IDA Pro", "ARMv8"],
    imageUrl: supercellImg,
  },
  {
    title: "pong-game",
    description:
    "Développement d'un site web responsive inspiré de Pong, avec un chat, un système de matchmaking et un jeu en temps réel.",
    tags: ["Nest.js", "React", "Docker", "OAuth", "2Fa", "websocket"],
    imageUrl: pongImg,
  },
  {
    title: "ac-debugger",
    description:
      "Développement d'un débogueur Windows capable de traduire de l'assembleur en C++, permettant de résoudre des défis cryptographiques.",
    tags: ["C++", "x86", "Windows API", "déobfuscation"],
    imageUrl: debuggerImg,
  },
  {
    title: "offline-activision",
    description:
    "Développement de logiciels permettant de désactiver des protections digitales empêchant l'accès hors ligne des jeux Activision.",
    tags: ["C++", "x86", "Ghidra", "Arxan", "dévirtualisation"],
    imageUrl: offlineActivisionImg,
  },
] as const;

export const fsSkillsData = [
  "HTML",
  "CSS",
  "JavaScript",
  "TypeScript",
  "React",
  "Vite",
  "Next.js",
  "Nest.js",
  "Node.js",
  "Git",
  "Tailwind",
  "Prisma",
  "MongoDB",
  "Redux",
  "Express",
  "PostgreSQL",
  "Framer Motion",
  "Appwrite",
  "Docker",
  "shadcn",
  "NextUI",
  "MUI"
] as const;

export const llSkillsData = [
  "IDA Pro",
  "Ghidra",
  "C",
  "C++",
  "C#",
  "Python",
  "Rust",
  "Java",
  "BurpSuite",
  "Wireshark",
  "Assembleur x86",
  "Assembleur ARM",
  "Windows API",
  "Windows Kernel Programming",
  "ReClass",
  "x64dbg",
  "VMWare",
  "VirtualBox",
  "dnSpy"
] as const;
