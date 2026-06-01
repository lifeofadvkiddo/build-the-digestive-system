"use strict";

const ORGAN_DATA = [
  
  {
    id: "oesophagus",
    label: "Oesophagus",
    layer: 6,
    color: "#ff7043",
    image: "images/oesophagus.svg",
    // cardPosition: { x: 20, y: 100 },
    zone: { x: 190, y: 135, width: 34, height: 200 },
    place: { x: 70, y: 95, width: 260, height: 340 },
    fact: "The oesophagus pushes food down to the stomach using muscle squeezes! 💪",
    svg: `<rect x="238" y="100" width="18" height="120" rx="9" fill="#ff7043"/>`
  },
  {
    id: "stomach",
    label: "Stomach",
    layer: 3,
    color: "#ffa726",
    image: "images/stomach.svg",
    // cardPosition: { x: 20, y: 180 },
    zone: { x: 130, y: 375, width: 155, height: 85 },
    place: { x: 150, y: 375, width: 170, height: 130 },
    fact: "Your stomach churns food with acid and turns it into a thick liquid! 🌀",
    svg: `<ellipse cx="235" cy="255" rx="45" ry="35" fill="#ffa726"/>`
  },
  {
    id: "small-intestine",
    label: "Small Intestine",
    layer: 5,
    color: "#ab47bc",
    image: "images/small intestine.svg",
    // cardPosition: { x: 20, y: 260 },
    zone: { x: 142, y: 465, width: 135, height: 95 },
    place: { x: 127, y: 490, width: 155, height: 135 },
    fact: "This super-long tube absorbs nutrients into your blood. It's 6 metres long! 📏",
    svg: `<ellipse cx="240" cy="355" rx="55" ry="42" fill="#ab47bc"/>`
  },
  {
    id: "large-intestine",
    label: "Large Intestine",
    layer: 4,
    color: "#26a69a",
    image: "images/large intestine.svg",
    // cardPosition: { x: 20, y: 340 },
    zone: { x: 130, y: 450, width: 160, height: 125 },
    place: { x: 102, y: 450, width: 210, height: 180 },
    fact: "The large intestine absorbs water and makes waste into solid poo! 💧",
    svg: `<rect x="175" y="310" width="130" height="105" rx="30" fill="#26a69a"/>`
  },
  {
    id: "rectum",
    label: "Rectum",
    layer: 1,
    color: "#ef5350",
    image: "images/rectum.svg",
    // cardPosition: { x: 20, y: 420 },
    zone: { x: 135, y: 580, width: 155, height: 45 },
    place: { x: 182, y: 608, width: 45, height: 40 },
    fact: "The rectum stores waste until your body is ready to get rid of it! 🗃️",
    svg: `<rect x="230" y="425" width="30" height="55" rx="12" fill="#ef5350"/>`
  },
  {
    id: "anus",
    label: "Anus",
    layer: 2,
    color: "#8d6e63",
    image: "images/anus.svg",
    // cardPosition: { x: 20, y: 500 },
    zone: { x: 135, y: 630, width: 155, height: 45 },
    place: { x: 188, y: 634.7, width: 36, height: 40 },
    fact: "The anus releases waste from your body — digestion complete! 🎉",
    svg: `<circle cx="245" cy="500" r="16" fill="#8d6e63"/>`
  }
];