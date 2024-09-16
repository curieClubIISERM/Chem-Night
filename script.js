import { questions } from "./quiz-data.js"
import { gameRules, generalRules } from "./quizrule.js";

// Game variables that you can adjust according to your quiz type
const cooldownTime = 5000; // Cooldown time between actions in milliseconds (5 seconds)
var autoChange = false;  // Determines whether the question should change automatically after a set time or if it needs to be changed manually.

// Constants
const NUMBER_OF_ROUNDS = Object.keys(gameRules).length;
var roundNumber = 1;
var roundKey = `round${roundNumber}`;
var questionNumber = 0;
var questionTime = gameRules.round1.MAX_TIME; // Time for the current question in seconds
var currentQuesType = gameRules.round1.QUESTION_TYPE

// Calculate total number of questions
const totalQuestions = Object.keys(questions).reduce((total, round) => {
    const validQuestions = Object.keys(questions[round]).filter(key => key !== "0");
    return total + validQuestions.length;
}, 0);

// Variables for timer and cooldown management
var timerInterval;
let lastActionTime = 0;
var coolDownTimeLeft = 0;

// DOM element references
const coverButton = document.querySelector("#coverbtn");
const guidebtn = document.querySelector(".explore-button");
const prevBtn = document.querySelector(".prev-btn");
const nextBtn = document.querySelector(".next-btn");
const timerBox = document.querySelector(".timer-box");
const timerText = timerBox.querySelector("h1");
const roundInfo = document.getElementById("roundinfo");
const questionInfo = document.getElementById("questioninfo");
const autoChangeSwitch = document.getElementById("autochangeswitch")

const roundHeading = document.getElementById("rule-heading");
const rulesList = document.getElementById('round-rules');
const pointCorrectText = document.getElementById("points-correct");
const pointIncorrectText = document.getElementById("points-incorrect");
const pointNoAnswerText = document.getElementById("points-donot-answer");

const questionTextBox = document.querySelector(".question-text-box p");
const optionA = document.getElementById("optionA");
const optionB = document.getElementById("optionB");
const optionC = document.getElementById("optionC");
const optionD = document.getElementById("optionD");
const reactionContainer = document.getElementById("reactionConatiner");
const pictureConatiner = document.getElementById("pictureContainer");

autoChangeSwitch.onchange = () => {
    autoChange = autoChangeSwitch.value;
}

// Update the current round UI based on game rules
function updateRound() {
    roundKey = `round${roundNumber}`;
    roundInfo.textContent = "Round " + roundNumber;

    if (gameRules[roundKey]) {
        roundInfo.textContent = `Round ${gameRules[roundKey].ROUND_NUMBER}`;
        questionTime = gameRules[roundKey].MAX_TIME;
        clearInterval(timerInterval); // Clear the timer for the new round
        updateTimer(); // Start the timer for the new round

        // Handle animation and state transitions between different question types
        var prevQuesElem = document.querySelector(".active");
        var currentQuesElem = document.querySelector(`.${String(gameRules[roundKey].QUESTION_TYPE)}`)
        currentQuesType = gameRules[roundKey].QUESTION_TYPE;

        if (prevQuesElem != currentQuesElem) {
            const state = Flip.getState([prevQuesElem, currentQuesElem], {
                props: "right, width"
            });

            prevQuesElem.classList.remove("active");
            gsap.to(prevQuesElem, {
                opacity: 0,
                onComplete: () => {
                    prevQuesElem.classList.add("inactive");
                }
            })
            currentQuesElem.classList.add("active");
            gsap.to(currentQuesElem, {
                opacity: 0,
                onStart: () => {
                    currentQuesElem.classList.remove("inactive");
                    gsap.to(prevQuesElem, {
                        opacity: 0
                    })
                }
            })

            Flip.from(state, {
                duration: 0.5,
                ease: "power2.inOut",
                absolute: true
            });
        }

    } else {
        alert('Invalid round number selected.');
    }
}

// Initialize and update the countdown timer for each question
function updateTimer() {
    let currentTimer = questionTime;
    let isTimer1Active = true;

    document.getElementById("timer1").textContent = currentTimer;
    document.getElementById("timer2").style.opacity = 0;

    function countdown() {
        if (currentTimer <= 0) {
            clearInterval(timerInterval); // Stop the timer if it reaches 0
            if (gameRules[roundKey].RAPID || (autoChange)) {
                questionNumber += 1;
                updateQuestionNumber(); // Update to the new question number
                lastActionTime = new Date().getTime();
            }
            return;
        }

        currentTimer--;

        // Update timer text and animation for first question
        if (questionNumber == 0) {
            currentTimer = questionTime;
            isTimer1Active = false;
            gsap.to(".timer-box h2", { text: "will be given for each question", ease: "expo.out", duration: 0.5 })
        } else {
            gsap.to(".timer-box h2", { text: "seconds left", duration: 0.1, ease: "expo.in" })
        }

        var progress = (currentTimer / questionTime) * 100;

        gsap.to(".timer-box", {
            "--progress-height": `${progress}%`,
            duration: 1
        });

        // Handle visual changes for low time
        if (currentTimer <= 4) {
            gsap.to("#timer2", {
                color: "#f00",
                duration: 0.5
            });
            gsap.to(".timer-box h2, #timer1", {
                color: "#fff",
                duration: 0.5
            })
        } else {
            gsap.set("#timer1, #timer2, .timer-box h2", {
                color: progress < 30 ? "#fff" : "#000",
                duration: 0.5
            })
        }

        // Alternate between timer1 and timer2 for visual effect
        if (isTimer1Active) {
            document.getElementById("timer2").textContent = currentTimer;
            gsap.to("#timer1", { opacity: 0, ease: "expo.out", duration: 0.5 });
            gsap.to("#timer2", { opacity: 1, ease: "expo.out", duration: 0.5 });
        } else {
            document.getElementById("timer1").textContent = currentTimer;
            gsap.to("#timer2", { opacity: 0, ease: "expo.out", duration: 0.5 });
            gsap.to("#timer1", { opacity: 1, ease: "expo.out", duration: 0.5 });
        }

        isTimer1Active = !isTimer1Active; // Toggle between timers
    }

    timerInterval = setInterval(countdown, 1000); // Start the countdown
}

// Update the question number and handle round transitions
function updateQuestionNumber() {
    if (!gameRules[roundKey]) {
        alert('Invalid round number.');
        return;
    }

    // Check if the question number exceeds the current round's questions
    if (questionNumber > gameRules[roundKey].NUM_QUESTIONS) {
        roundNumber++;

        if (gameRules[`round${roundNumber}`]) {
            questionNumber = 0;
            updateRound(); // Proceed to next round
        } else {
            gsap.to(".question-text-box, .lowerpart", {
                opacity: 0,
                ease: "power2.inOut",
                duration: 1,
                onComplete: () => {
                    gsap.to(".end-message", {
                        onStart: () => {
                            gsap.set(".end-message", {display: "flex"})
                        },
                        opacity: 1,
                        duration: 1,
                        ease: "ease.InOut"
                    })
                }
            })
            return
        }
    } else if (questionNumber < 0) {
        roundNumber--;
        if (gameRules[`round${roundNumber}`]) {
            roundKey = `round${roundNumber}`;
            questionNumber = gameRules[`round${roundNumber}`].NUM_QUESTIONS;
            updateRound(); // Go back to previous round
        } else {
            roundNumber = 1;
            questionNumber = 0;
        }
    }

    var question = questions[roundKey][questionNumber];  // Fetch the current question
    const roundData = gameRules[roundKey];

    // Handle UI transitions between rounds and questions
    if (questionNumber == 0) {
        // Show rules for the new round
        gsap.set(".active", { opacity: 0 })
        gsap.set(".rulebox", { scale: 0, x: 0 })
        gsap.set(roundHeading, { opacity: 0 });
        const tl = gsap.timeline({ defaults: { ease: "power2.inOut", duration: 0.5 } });
        tl.to(questionInfo, { text: "Rules" })
        tl.to(".rulebox", { opacity: 1, scale: 1, ease: "expo.out" }, "<")
            .to(questionTextBox, { text: gameRules[roundKey].ROUND_NAME }, "=-1");

        tl.to(roundHeading, { opacity: 1, ease: "power2.in", delay: 0.5 }, "<");

        // Clear and update the rules list
        rulesList.innerHTML = "";
        roundData.RULES.forEach((rule, index) => {
            const li = document.createElement('li');
            li.style.opacity = 0;
            rulesList.appendChild(li);
            tl.to(li, {
                text: `${rule}`,
                opacity: 1,
                delay: 0.2 * index,
            }, "-=0.3");
        });

        // Display points for correct, incorrect, and no answers
        const correctLi = document.createElement('li');
        correctLi.style.opacity = 0;
        rulesList.appendChild(correctLi);
        tl.to(correctLi, {
            text: `+${roundData.POINTS_CORRECT} points for a ✔️ (correct answer).`,
            opacity: 1
        }, "-=0.3");

        if (roundData.POINTS_NO_ANSWER) {
            const noAnswerLi = document.createElement('li');
            noAnswerLi.style.opacity = 0;
            rulesList.appendChild(noAnswerLi);
            tl.to(noAnswerLi, {
                text: `${roundData.POINTS_NO_ANSWER} points for 🚫 (no answer).`,
                opacity: 1
            }, "-=0.3");
        }

        const incorrectLi = document.createElement('li');
        incorrectLi.style.opacity = 0;
        rulesList.appendChild(incorrectLi);
        tl.to(incorrectLi, {
            text: `${roundData.POINTS_INCORRECT} points for a ❌ (incorrect answer).`,
            opacity: 1
        }, "-=0.3");
        tl.from(".points", {
            scale: 0,
            duration: 0.5,
            stagger: 0.1,
            onStart: () => {
                if (roundData.POINTS_NO_ANSWER) {
                    document.getElementById("points-no-answer").classList.add("has-rule")
                } else {
                    document.getElementById("points-no-answer").classList.remove("has-rule")
                }
            }
        }, "-=0.3")

        // Animate the points display for correct, no answer, and incorrect answers
        tl.to(pointCorrectText, {
            duration: 0.5,
            text: `+${roundData.POINTS_CORRECT}`,
            ease: "expo.Out"
        }, "-=0.3")
        if (roundData.POINTS_NO_ANSWER) {
            tl.to(pointNoAnswerText, {
                duration: 0.5,
                text: `${roundData.POINTS_NO_ANSWER}`,
                ease: "expo.Out"
            }, "-=0.3")
        }

        tl.to(pointIncorrectText, {
            duration: 0.5,
            text: `${roundData.POINTS_INCORRECT}`,
            ease: "expo.Out"
        }, "-=0.3")
    } else {
        // Show the next question
        gsap.to(questionInfo, { duration: 0.5, text: `Question No. ${questionNumber}`, ease: "power2.inOut" });
        gsap.to(questionTextBox, { duration: 0.5, text: question["question"], ease: "power2.inOut" });
        gsap.to(".active", { opacity: 1, duration: 0.5, ease: "power2.in" })
        gsap.to(".rulebox", { opacity: 0, duration: 0.5, ease: "expo.out" });
    }

    // Handle different question types (MCQ, Reaction, Visual)
    if (currentQuesType == "MCQ") {
        if (questionNumber == 0) {
            gsap.to(optionA, { duration: 0.5, text: ``, ease: "power2.inOut" });
            gsap.to(optionB, { duration: 0.5, text: ``, ease: "power2.inOut" });
            gsap.to(optionC, { duration: 0.5, text: ``, ease: "power2.inOut" });
            gsap.to(optionD, { duration: 0.5, text: ``, ease: "power2.inOut" });
        } else {
            // Show options for the MCQ question
            if (question["options"]["A"] == "") {
                gsap.to(optionA, { duration: 0.5, opacity: 0, text: ``, ease: "power2.inOut" });
                gsap.to(optionB, { duration: 0.5, opacity: 0, text: ``, ease: "power2.inOut" });
                gsap.to(optionC, { duration: 0.5, opacity: 0, text: ``, ease: "power2.inOut" });
                gsap.to(optionD, { duration: 0.5, opacity: 0, text: ``, ease: "power2.inOut" });
            } else {
                // Show options for the MCQ question options based on the data passed
                gsap.to(optionA, { duration: 0.5, opacity: 1, text: `A. ${question["options"]["A"]}`, ease: "power2.inOut" });
                gsap.to(optionB, { duration: 0.5, opacity: 1, text: `B. ${question["options"]["B"]}`, ease: "power2.inOut" });
                gsap.to(optionC, { duration: 0.5, opacity: 1, text: `C. ${question["options"]["C"]}`, ease: "power2.inOut" });
                gsap.to(optionD, { duration: 0.5, opacity: 1, text: `D. ${question["options"]["D"]}`, ease: "power2.inOut" });
            }
        }
    } else if (currentQuesType == "Reaction") {
        // Handle chemical reaction questions (using MathJax for rendering)
        const p = reactionContainer.querySelector("p");

        if (questionNumber == 0) {
            gsap.set("#reactionConatiner p", { opacity: 0 });
            reactionContainer.querySelector("p").innerHTML = ` \( \text{2H}_2\text{O} \rightarrow \text{2H}_2 + \text{O}_2 \)`
            MathJax.typesetPromise([reactionContainer]).then(() => {
                gsap.to(p, {
                    color: "#000000ff",
                    duration: 1,
                    ease: "circ.out",
                })
            }).catch((err) => {
                console.error('MathJax rendering failed: ', err);
            });
        } else {
            gsap.to(p, {
                color: "#00000000",
                duration: 0.5,
                ease: "circ.out",
                onComplete: () => {
                    reactionContainer.querySelector("p").innerHTML = question["reaction"]
                    MathJax.typesetPromise([reactionContainer]).then(() => {
                        gsap.to("#reactionConatiner", { opacity: 1, duration: 0.5, ease: "expo.out" });
                        gsap.to("#reactionConatiner p", { opacity: 1 });
                        gsap.to(p, {
                            color: "#000000ff",
                            duration: 1,
                            ease: "circ.out",
                        })
                    }).catch((err) => {
                        console.error('MathJax rendering failed: ', err);
                    });
                }
            });
        }
    } else if (currentQuesType == "Visual") {
        // Handle visual-based questions (display an image)
        var pictureImg = pictureConatiner.querySelector("img");
        if (questionNumber == 0) {
            gsap.set("#pictureContainer img", { opacity: 0 })
            pictureImg.src = questions[roundKey][1]["path"];
        } else {
            gsap.to("#pictureContainer img", { opacity: 1, duration: 0.5, ease: "expo.out" })
            pictureImg.src = question["path"];
        }
    }
    clearInterval(timerInterval); // Clear the previous timer
    updateTimer(); // Restart the timer for the next question
}

// Check if the cooldown time between navigations has passed
function canNavigate() {
    const currentTime = new Date().getTime();
    coolDownTimeLeft = Math.ceil(5 - ((currentTime - lastActionTime) / 1000));
    return (currentTime - lastActionTime) >= cooldownTime;
}

// Navigate between questions based on direction (-1 for previous, +1 for next)
function navigateQuestion(direction) {
    if (canNavigate()) {
        questionNumber += direction;
        updateQuestionNumber(); // Update to the new question number
        lastActionTime = new Date().getTime();
    } else {
        alert(`Please wait for ${coolDownTimeLeft} seconds to cooldown to finish before navigating again.`);
    }
}

var changeUIOpened = false
// Handle keyboard navigation for questions
function handleQuestionNavigation(event) {
    if (!document.querySelector(".lowerpart").classList.contains("roundstart")) {
        if (event.key === 'ArrowLeft') {
            navigateQuestion(-1); // Move to previous question
        } else if (event.key === 'ArrowRight') {
            navigateQuestion(1); // Move to next question
        }
    } else {
        // Start the game from the initial screen
        if (event.key === ' ') {
            gsap.to(".dummylogo", {
                opacity: 0,
                duration: 0.5,
                ease: "power2.inOut",
                onUpdate: () => {
                    gsap.to(".dummylogo", {
                        fill: "red",
                    })
                },
                onComplete: () => {
                    gsap.set(".dummylogo", { display: "none" })
                }
            })
            gsap.to(".cover-event-name", {
                opacity: 1,
                duration: 0.5,
                ease: "power2.inOut"
            })
        }
    }
    if (event.key.toLowerCase() === "o") {
        gsap.to(".changevardiv", {
            left: changeUIOpened ? "-25vw" : "0vw",
            backdropFilter: changeUIOpened ? "blur(0px)" : "blur(3px)"
        });
        changeUIOpened = !changeUIOpened;
    }    
}

// Display general rules for the quiz
function createGeneralRules() {
    var tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });
    tl.to(questionTextBox, {
        opacity: 0,
        duration: 0.5,
        onStart: () => {
            gsap.set(".question-text-box", {
                display: "block",
            })
        },
        onComplete: () => {
            questionTextBox.innerHTML = "<h3>General Rules</h3>";

            const listItems = generalRules.rules.map(rule => `<li>${rule}</li>`).join('');
            questionTextBox.innerHTML += `<ul>${listItems}</ul>`;
        }
    })
    tl.to(questionTextBox, {
        opacity: 1,
        duration: 0.5,
        onStart: () => {
            tl.from(".question-text-box p li", {
                opacity: 0,
                stagger: 0.1
            })
        }
    })
    tl.to(guidebtn, {
        opacity: 1,
        duration: 0.5,
        ease: "elastic.out(1, 0.5)",
        onStart: () => {
            gsap.set(guidebtn, {
                display: "flex"
            })
        }
    })
}

function generalRuleToRoundRule() {
    gsap.to(guidebtn, {
        opacity: 0,
        onStart: () => {
            gsap.set(".lowerpart", {
                display: "flex"
            });
        },
        onComplete: () => {
            guidebtn.style.display = "none";
            gsap.to(".question-text-box p li", {
                opacity: 0,
                stagger: {
                    from: "end",
                    each: 0.3,
                },
                onStart: () => {
                    gsap.to(".question-text-box p li", {
                        display: "none",
                        stagger: {
                            from: "end",
                            each: 0.4,
                        },
                        onComplete: () => {
                            gsap.to(".question-text-box p ul", {
                                display: "none",
                            })
                            gsap.set(".question-text-box p", {
                                textAlign: "center",
                            })
                            document.querySelector(".question-text-box p").innerHTML = "";
                            gsap.to(".left-part", {
                                opacity: 1
                            })
                            document.querySelector(".lowerpart").classList.remove("roundstart");
                            updateQuestionNumber();
                            updateRound();
                        }
                    })
                }
            })

        }
    })
}

function roundRuleToRoundRule() {
    gsap.to(".lowerpart", {
        opacity: 0,
        duration: 0.5,
        ease: "power2.inOut",
        onComplete: () => {
            createGeneralRules();
        }
    }, ">")
}

function mainToGeneralRules() {
    var tl = gsap.timeline();
    if (document.querySelector(".dummylogo").style.opacity == "") {
        tl.to(".dummylogo", {
            opacity: 0,
            duration: 0.5,
            ease: "power2.inOut",
            onComplete: () => {
                gsap.set(".dummylogo", { display: "none" })
            }
        })
        tl.to(".cover-event-name", {
            opacity: 1,
            duration: 2,
            ease: "power4.out"
        })
    }
    tl.to(".cover-event-name", {
        x: 10,
        opacity: 0,
        duration: 0.5,
        ease: "power2.inOut",
    }, "start");
    tl.to(".clublogo", {
        x: -10,
        opacity: 0,
        duration: 0.5,
        ease: "power2.inOut",
    }, "start")
    tl.to("#coverbtn", {
        opacity: 0,
        duration: 0.5,
        ease: "power2.inOut",
        onComplete: () => {
            gsap.set(".coverpage", {
                display: "none",
            })
        }
    }, "start")
    createGeneralRules();
    tl.to(".upperpart", {
        opacity: 1,
        duration: 0.5,
        ease: "power2.inOut",
        onStart: () => {
            gsap.set(".upperpart", {
                display: "flex",
            })
        }
    })
}

roundInfo.addEventListener("click", function () {
    const isValidInput = (input) => {
        const num = parseInt(input);
        return !isNaN(num) && num >= 1 && num <= NUMBER_OF_ROUNDS;
    };

    let userInput = prompt(`Please enter the round number (1 to ${NUMBER_OF_ROUNDS}):`);

    if (isValidInput(userInput)) {
        roundNumber = parseInt(userInput);
        questionNumber = 0;
        updateRound();
        updateQuestionNumber();
    } else if (userInput !== null && userInput !== "") {
        alert(`Invalid round number. Please enter a number between 1 and ${NUMBER_OF_ROUNDS}.`);
    }
});

document.addEventListener('keydown', handleQuestionNavigation);

prevBtn.addEventListener("click", () => {
    navigateQuestion(-1);
});

nextBtn.addEventListener("click", () => {
    navigateQuestion(1);
});

guidebtn.addEventListener("click", () => {
    generalRuleToRoundRule()
})

coverButton.addEventListener("click", () => {
    mainToGeneralRules();
})
