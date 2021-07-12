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
Determine <i>Event Focus</i>:

eventFocus switch
{
    < 7 => "Remote event",

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