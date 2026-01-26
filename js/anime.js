let staticanime = gsap.timeline();

staticanime.to(".arrayanime",{
    scale: 2,
    duration: 50,
    x: "-150vw",
    y: "130vh",
    ease: "none",
    repeat: -1,
    yoyo: true,
    repeatDelay: 4
}).to(".linkedanime",{
    scale: 3,
    duration: 40,
    x: "130vw",
    y: "130vh",
    ease: "none",
    repeat: -1,
    yoyo: true,
    repeatDelay: 1
},"-=50").to(".stackanime",{
    scale: 3,
    duration: 30,
    x: "-100vw",
    y: "-180vh",
    ease: "none",
    repeat: -1,
    yoyo: true,
    repeatDelay: 1
},"-=40")