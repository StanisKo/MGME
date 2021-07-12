### A flow of adventure to not forget :) ###
<pre>
User creates a scene
    |
    |
    |
    v
    First scene and it is seeded with random event ? <b>GOTO Random Event Flow</b> : Front end does 1D10 roll
        |
        |
        |
        v
        If 1D10 rollResult <= chaosFactor and rollResult is even, <b>GOTO Random Event Flow</b>
        |
        |
        |
        v
        Else if 1D10 rollResult <= chaosFactor and rollResult is odd, scene is <i>altered</i>
        |
        |
        |
        v
        Else scene proceeds as expected
<hr/>
User asks fate question
|
|
|
v
Front end does 1D100 roll
    |
    |
    |
    v
    If both digits of rollResult are equal, and one of them <= chaosFactor <b>GOTO Random Event Flow</b>
    |
    |
    |
    v
    Else <b>GOTO Fate Question Flow</b>
</pre>


### Random Event Flow: ###
<pre>

</pre>


### Fate Question Flow:
<pre>
User asks fate question (string) and provides:
odds (int 0-10), chaos factor (int 0-8), randomized 1D100 roll (int 1-100)
    |
    |
    |
    v
    Matrix of odds and margins initialized
        |
        |
        |
        v
        Where index of first-level array is the the odd,
        Index of second-level array is the chaos factor of adventure
        And each value of second-level array is an array of 3 ints: lowest margin, target value, highest margin
            |
            |
            |
            v
            As in:
                    [
                        <b>Odd</b>
                        [
                            <b>Chaos Factor</b>
                            [Lowest Margin, Target Value, Highest Margin],

                            <b>Chaos Factor</b>
                            [Lowest Margin, Target Value, Highest Margin],
                        ],

                        <b>Odd</b>
                        [
                            <b>Chaos Factor</b>
                            [Lowest Margin, Target Value, Highest Margin],

                            <b>Chaos Factor</b>
                            [Lowest Margin, Target Value, Highest Margin],
                        ]
                    ]

                    <i>First-, second-, and third-level arrays have predetermined size:</i>

                    int[,,] oddsAndMargins = new int[11, 9, 3] {}
            |
            |
            |
            v
            We retrieve margins: int[] margins = oddsAndMargins[odds, chaosFactor]
            |
            |
            |
            v
            If rollResult <= margins[targetValue]: "Yes"

            If rollResult > margins[targetValue]: "No"

            If rollResult <= margins[lowestMargin]: "Exceptional Yes"

            If rollResult >= margins[highestMargin]: "Exceptional No"
        |
        |
        |
        v
        Update fate question with answer
</pre>