### A flow of adventure to not forget :) ###
<pre>
User creates a scene
    |
    |
    |
    v
    If first scene
        |
        |
        |
        v
        If seeded with random event <b>GOTO Random Event Flow</b>
        |
        |
        |
        v
        Else scene proceeds as expected
    |
    |
    |
    v
    Else roll 1D10
        |
        |
        |
        v
        If rollResult <= chaosFactor and rollResult is even, <b>GOTO Random Event Flow</b>
        |
        |
        |
        v
        Else if rollResult <= chaosFactor and rollResult is odd, scene is <i>altered</i>
        |
        |
        |
        v
        Else scene proceeds as expected
<hr/>
Then within scene:

User asks fate question
|
|
|
v
Roll 1D100
|
|
|
v
<b>GOTO Fate Question Flow</b>
|
|
|
v
Return with answer
    |
    |
    |
    v
    If both digits of rollResult are equal and one of them <= chaosFactor <b>GOTO Random Event Flow</b>
    |
    |
    |
    v
    Else scene proceeds as expected
</pre>


### Random Event Flow: ###
<pre>
Random even is requested
|
|
|
v
Roll 1D100
    |
    |
    |
    v
    Determine <i>Event Focus</i>:

    rollResult switch
    {
        <= 7 => "Remote event",

        (> 7) and (<= 28) => "NPC action",

        (> 28) and (<= 35) => "Introduce new NPC",

        (> 35) and (<= 45) => "Move toward a thread",

        (> 45) and (<= 52) => "Move away from a thread",

        (> 52) and (<= 55) => "Close a thread",

        (> 55) and (<= 67) => "PC negative",

        (> 67) and (<= 75) => "PC positive",

        (> 75) and (<= 83) => "Ambiguous event",

        (> 83) and (<= 92) => "NPC negative",

        (> 92) and (<= 100) => "NPC positive"
    }
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

Where index of first-level array is the the odd,
Index of second-level array is the chaos factor of adventure
And each value of second-level array is an array of 3 ints: lowest margin, target value, highest margin

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
    Determine answer:

    rollResult switch
    {
        <= margins[targetValue] => "Yes"

        > margins[targetValue] => "No"

        <= margins[lowestMargin] => "Exceptional Yes"

        >= margins[highestMargin] => "Exceptional No"
    }
|
|
|
v
Update fate question with answer and return to scene
</pre>