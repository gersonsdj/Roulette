# ROULETTE
### Video Demo: https://youtu.be/TKm4BcENrLs

### Distinctiveness and Complexity:
I believe that my project satisfies the distinctiveness and complexity requirements, because I applied all the features I've learned so far such as DB, Python, Django (Model, Views, Templates), Javascript, CSS, and HTML.

### Files description:
- All Django structure such as urls.py, views.py, models.py were used.
- 0002_auto_20211201_0226.py -> Migration file to populate some values on the tables (Fixed values).
- db.sqlite3 -> DB file
- roulette.html -> Main Strategy Page
- layout.html -> Main template file
- login.html -> Login Page
- register.html -> Register Page
- roulette.js -> Main JS file
- styles.css -> Common CSS sheet
- roulette.css -> Roulette table CSS sheet

### How to Run:
Just run *python3 manage.py runserver* from root folder. Then open http://localhost:8080 from Browser.

#### Description:

*Roulette* is a casino game named after the French word meaning little wheel which was likely developed from the Italian game Biribi.
In the game, players may choose to place bets on either a single number, various groupings of numbers, the colors red or black, whether the number is odd or even, or if the numbers are high (19–36) or low (1–18).

To determine the winning number, a croupier spins a wheel in one direction, then spins a ball in the opposite direction around a tilted circular track running around the outer edge of the wheel.
The ball eventually loses momentum, passes through an area of deflectors, and falls onto the wheel and into one of 37 (single zero French/European style roulette)
or 38 (double zero American style roulette) or 39 (triple zero "Sands Roulette")[citation needed] colored and numbered pockets on the wheel.
The winnings are then paid to anyone who has placed a successful bet.

#### Types of bets
In roulette, bets can either be inside or outside bets.

#### Inside bets
- *Name* - Description	Chip placement
- *Straight/Single*	- Bet on a single number	Entirely within the square for the chosen number
- *Split*	- Bet on two vertically/horizontally adjacent numbers (e.g. 14-17 or 8–9)	On the edge shared by the numbers
- *Street* - Bet on three consecutive numbers in a horizontal line (e.g. 7-8-9)	On the outer edge of the number at either end of the line
- *Corner/Square* - Bet on four numbers that meet at one corner (e.g. 10-11-13-14)	On the common corner
- *Six Line/Double Street* - Bet on six consecutive numbers that form two horizontal lines (e.g. 31-32-33-34-35-36)	On the outer corner shared by the two leftmost or the two rightmost numbers
- *Trio* - A three-number bet that involves at least one zero: 0-1-2 (either layout); 0-2-3 (single-zero only); 00-2-3 (double-zero only)	On the corner shared by the three chosen numbers
- *First Four* - Bet on 0-1-2-3 (Single-zero layout only)	On the outer corner shared by 0-1 or 0-3
- *Basket* - Bet on 0-00-1-2-3 (Double-zero layout only)	On the outer corner shared by 0-1 or 00-3

#### About the Project
This project is based on Javascript for Client logic, and Python/Django for Server logic. 

All the visual effects were built on JS + CSS.

The idea of this project is to have a platform where the user can save his/her Strategy for Roulette game. He/She can add new Strategies, edit them or delete.
There is a validation for Strategy Name, we can not have two strategies with same name for same user.

For now, this website just save the strategy, but there is a plan for future improvement and make it more useful as below:

1. Add a new page for Testing the Strategy (DB is ready for this)
2. Allow the user to create his/her own Testing Method by inputting Strategy system and which incremental method (fibonacci, martingale, etc). Also he/she will have to provide the initial bankroll how many bets he/she want to do at maximum.
3. Run a method on BE (Python), for calculate the probability of win after a number of consecutive games. (Using this Testing Page)
4. Display visually (using a package called matplotlib.pyplot) a line graphic showing how many wins or losses. 
5. Oportunity to visit/clone strategies from another users.
6. Add Support for another Roulette types such as American/French (already on DB).
