from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator

MAX_LOSS_TYPE = (
    ('quantity', 'Quantity'),
    ('value', 'Value'),
    ('both', 'Quantity and Value')
)

ITEMIZATOR = " <br>  * "

class RouletteType(models.TextChoices):
    EURO = 'european', "European"
    # AMERICAN = 'american', "American" --> will be implemented in the future
    # FRENCH = 'french', "French"

class User(AbstractUser):
    def __str__(self):
        return f'{self.first_name} {self.last_name}'.strip() or str(self.username)


# Fixed
class Position(models.Model):
    name = models.TextField(blank=False)
    roulette_type = models.CharField(max_length=8, choices=RouletteType.choices, default=RouletteType.EURO)
    payout = models.FloatField(blank=False)
    winning_numbers = models.TextField(blank=False) # List of winning numbers comma separated e.g. '1,2,3,4,5,6'
    roullete_position = models.BooleanField(default=False) # if this position is part of the roulette wheel

    def __str__(self) -> str:
        return self.name

    class Meta():
        db_table = "Position"

    def serialize(self, bet = 0):
        return {
            "name": self.name,
            "roulette_type": self.roulette_type,
            "payout": self.payout,
            "winning_numbers": self.winning_numbers,
            "roullete_position": self.roullete_position,
            "left": 0, # Will be used on the page styling
            "top": 0, # Will be used on the page styling
            "bet": bet # Will be used on the page logic
        }

# Fixed
class Method(models.Model):
    name = models.TextField(blank=False)  # Fibonacci, Incremental, Martingale...
    description = models.TextField(blank=True)

    class Meta():
        db_table = "Method"

    def serialize(self):
        return {
            "name": self.name,
            "description": self.description
        }

class Strategy(models.Model):
    name = models.TextField(blank=False)
    timestamp = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="strategies")
    roulette_type = models.CharField(max_length=8, choices=RouletteType.choices, default=RouletteType.EURO)
    user_added = models.BooleanField(default=True)

    def getBets(self):
        return ITEMIZATOR+ITEMIZATOR.join([str(bet) for bet in self.bets.all()])

    def getPositions(self):
        return [bet.position.serialize(bet.amount) for bet in self.bets.all()]

    def serialize(self):
        return {
            "id": self.pk,
            "name": self.name,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p"),
            "roulette_type": self.roulette_type,
            "tests": self.tests.all().count(),
            "positions": self.getPositions(),
            "bets": self.getBets()
        }

class Testing(models.Model):
    name = models.TextField(blank=False)
    timestamp = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="tests")
    strategy = models.ForeignKey("Strategy", on_delete=models.CASCADE, related_name="tests")
    method = models.ForeignKey("Method", on_delete=models.CASCADE, related_name="tests")
    max_loss_qty = models.FloatField(validators=[MinValueValidator(0.0)], default=0)
    max_loss_value = models.FloatField(validators=[MinValueValidator(0.0)], default=0)
    max_loss_option = models.CharField(max_length=8, choices=MAX_LOSS_TYPE, default='quantity')
    max_bets = models.FloatField(validators=[MinValueValidator(0.0)], default=0)


class Bet(models.Model):
    position = models.ForeignKey("Position", on_delete=models.CASCADE, related_name="bets")
    strategy = models.ForeignKey("Strategy", on_delete=models.CASCADE, related_name="bets")
    amount = models.FloatField(validators=[MinValueValidator(0.5)], default=1)

    def __str__(self) -> str:
        return f'[{self.position.name}] : ${self.amount}'
