### Adventure Flow ###
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
        If seeded with random event <b>GOTO Random Event Flow</b> and use it as an input for setup
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
    If rollResult <= chaosFactor then scene must be modified
        |
        |
        |
        v
        If rollResult is odd, alter the scene setup
        |
        |
        |
        v
        Else if rollResult is even, scene is <i>interrupted</i>
        |
        |
        |
        v
        <b>GOTO Random Event Flow</b> and modify setup based on output
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
|
|
|
v
User creates a battle
|
|
|
v
User resolves the scene and modifies adventure's chaos factor
|
|
|
v
Repeat flow
|
|
|
v
User resolves the adventure
</pre>


### Random Event Flow: ###
<pre>
Random event is requested
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
    |
    |
    |
    v
    <i>Event Meaning</i> and <i>Event Subject</i> arrays of strings are initialized
    |
    |
    |
    v
    Roll 1D100 on Event Meaning and roll 1D100 on Event Subject to get necessary values
    |
    |
    |
    v
    Create random event and return to the caller
</pre>


### Fate Question Flow:
<pre>
User asks fate question (string) and provides: odds (int 0-10), chaos factor (int 0-8)
|
|
|
v
Roll 1D100
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
Update fate question with answer and rollResult and return to scene
</pre>