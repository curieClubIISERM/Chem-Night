export const generalRules = {
    rules: [
        'Each group will contain only 2 students.',
        'The quiz will consist of five rounds.',
        'Each round will have a time limit of 60, 90, 120, 60, and 15 seconds, respectively.',
        'There will be an elimination of teams after round 3 and 4. We will inform you how many teams will qualify for the round 3 and 4.',
        '10% of the points earned in the previous round will be added to your total score in the next round.',
        'The team with the highest score at the end of the quiz will be declared the winner.'
    ]
}

export const gameRules = {
    round1: {
        ROUND_NUMBER: 1,
        ROUND_NAME: 'Round 1 ( Multiple Choice Questions )',
        MAX_TIME: 60,
        NUM_QUESTIONS: 10,
        QUESTION_TYPE: 'MCQ',
        POINTS_CORRECT: 10,
        POINTS_INCORRECT: -5,
        QUALIFICATION_CRITERIA: 'Top 10 teams qualify for the next round',
        RULES: [
            'Each question in this round will have a time limit of 60 seconds.',
        ]
    },
    round2: {
        ROUND_NUMBER: 2,
        ROUND_NAME: 'Round 2 (Complete Me)',
        MAX_TIME: 120,
        NUM_QUESTIONS: 5,
        QUESTION_TYPE: 'Reaction',
        POINTS_CORRECT: 20,
        POINTS_INCORRECT: -5,
        QUALIFICATION_CRITERIA: 'Top 5 teams qualify for the next round',
        RULES: [
            'Each question in this round will have a time limit of 90 seconds.'
        ]
    },
    round3: {
        ROUND_NUMBER: 3,
        ROUND_NAME: 'Round 3 (Visual Round)',
        MAX_TIME: 120,
        NUM_QUESTIONS: 3,
        QUESTION_TYPE: 'Visual',
        POINTS_CORRECT: 20,
        POINTS_INCORRECT: -5,
        POINTS_NO_ANSWER: -10,
        QUALIFICATION_CRITERIA: 'Top 3 teams qualify for the next round',
        RULES: [
            "This round is a visual question round where you'll see a picture of reactions or processes, and you'll need to provide the correct answer.",
            "Each question in this round will have a time limit of 120 seconds.",
            "The top 16 teams will qualify for the next round."
        ]
    },
    round4: {
        ROUND_NUMBER: 4,
        ROUND_NAME: 'Round 4 (Balancing)',
        MAX_TIME: 60,
        NUM_QUESTIONS: 5,
        QUESTION_TYPE: 'Reaction',
        POINTS_CORRECT: 10,
        POINTS_INCORRECT: -5,
        QUALIFICATION_CRITERIA: 'Top 10 teams qualify for the final round',
        RULES: [
            'Each question in this round will have a time limit of 60 seconds.',
            'The top 10 teams will qualify for the final round.'
        ]
    },
    round5: {
        ROUND_NUMBER: 5,
        ROUND_NAME: 'Round 5 (Final Round)',
        MAX_TIME: 15,
        NUM_QUESTIONS: 10,
        QUESTION_TYPE: 'MCQ',
        POINTS_CORRECT: 10,
        POINTS_INCORRECT: -4,
        RAPID: true,
        QUALIFICATION_CRITERIA: 'Final round, no qualification needed',
        RULES: [
            'Each question in this final round will have a time limit of 15 seconds.'
        ]
    }
};