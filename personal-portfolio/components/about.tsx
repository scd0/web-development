"use client";

import React from "react";
import SectionHeading from "./section-heading";
import { motion } from "framer-motion";
import { useSectionInView } from "@/lib/hooks";

export default function About() {
  const { ref } = useSectionInView("About");

  return (
    <motion.section
      ref={ref}
      className="mb-28 max-w-[45rem] text-center leading-8 sm:mb-40 scroll-mt-28"
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.175 }}
      id="about"
    >
      <SectionHeading>À propos de moi</SectionHeading>
      <p className="mb-3">
        Je suis passionné d'informatique depuis mon plus jeune âge.
        Doté d'une curiosité insatiable, je m'intéresse à tout ce qui concerne ce domaine.

        <br />
        <br />
        🕹️ J'aime développer des jeux vidéos avec mon propre moteur de jeu que j'ai réalisé en&nbsp;
        <span className="font-bold">C++</span> et en utilisant des technologies telles que <span className="font-bold">DirectX</span>. 
        J'explore aussi les vastes possibilités offertes par des moteurs puissants tels que <span className="font-bold">Unreal Engine</span>. 
        Les jeux vidéos ne sont pas qu'un simple divertissement pour moi ; ce sont des supports de travail ainsi que des sources d'inspiration et d'apprentissage.
        <br />
        <br />
        💻 J'aime créer des applications web et mobiles qui repoussent les limites de l'expérience utilisateur, 
        en utilisant les dernières technologies comme <span className="font-bold">Next.js</span> et <span className="font-bold">Framer Motion</span>&nbsp;pour des interfaces fluides et immersives.
        <br />
        <br />
        ⚡ Je suis fasciné par le hardware. Je démonte des objets pour étudier leurs composants tels que les puces ou les circuits imprimés. J'aime aussi modifier leur fonctionnement en extrayant le software afin de le remplacer par ma propre version.
        <br />
        <br />
      </p>

      <p>
      🌎 Quand je ne code pas, j'aime bien passer du temps à regarder des films et des séries de science-fiction. J'adore voyager pour découvrir des paysages et des cultures différentes, et passer du temps avec mes amis.
      </p>
    </motion.section>
  );
}
