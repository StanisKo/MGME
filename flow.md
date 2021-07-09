### A flow of adventure to not forget :)

User creates adventure
|
|
|
v
Roll, if both digits of rollResult are equal, GOTO Random Event Flow, else GOTO Fate Question Flow

### Random Event Flow:

### Fate Question Flow:

User asks fate question (string) and provides:
odds (int 0-10), chaos factor (int 0-8), randomized 1D100 roll (int 0-100)
    |
    |
    |
    v
    Matrix of odds and margins initialized
        |
        |
        |
        v
        Where index of first-level array is the int of the odd,
        Index of second-level array is the chaos factor of adventure
        And each value of second-level array is an array of 3 ints: lowest margin, target value, highest margin
            |
            |
            |
            v
            As in:
                    [
                        # Odd
                        [
                            # Chaos Factor
                            [Lowest Margin, Target Value, Highest Margin],

                            # Chaos Factor
                            [Lowest Margin, Target Value, Highest Margin],
                        ],

                        # Odd
                        [
                            # Chaos Factor
                            [Lowest Margin, Target Value, Highest Margin],

                            # Chaos Factor
                            [Lowest Margin, Target Value, Highest Margin],
                        ]
                    ]

                    # First-, second-, and third-level arrays have predetermined size:

                    # Where
                    int[,,] oddsAndMargins = new int[11, 8, 3] {}
            |
            |
            |
            v
            We retrieve margins: int[] margins = oddsAndMargins[odds][chaosFactor]
            |
            |
            |
            v
            # If rollResult <= margins[targetValue]: "Yes"

            # If rollResult > margins[targetValue]: "No"

            # If rollResult <= margins[lowestMargin]: "Exceptional Yes"

            # If rollResult >= margins[highestMargin]: "Exceptional No"
        |
        |
        |
        v
        Update fate question with answer