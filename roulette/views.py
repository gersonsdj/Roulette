from cmath import exp
import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.http.response import JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt

from .models import Method, Strategy, User, Position, Bet


def index(request):
    return render(request, "roulette/roulette.html")


@csrf_exempt
@login_required(login_url='/login')
def testing(request, strategy):
    try:
        strategy_obj = Strategy.objects.get(pk=strategy)
        return render(request, "roulette/roulette.html", {"strategy": strategy_obj})
    except Strategy.DoesNotExist:
        return HttpResponseRedirect(reverse("index"))


def positions(request):
    # Get positions must be via GET
    if request.method != "GET":
        return HttpResponse(status=400, reason="GET request required.")

    positions = Position.objects.order_by("pk").all()
    positions_list = [pos.serialize() for pos in positions]
    return JsonResponse(positions_list, safe=False)


def methods(request):
    # Get methods must be via GET
    if request.method != "GET":
        return HttpResponse(status=400, reason="GET request required.")

    methods = Method.objects.order_by("pk").all()
    methods_list = [method.serialize() for method in methods]
    return JsonResponse(methods_list, safe=False)   


@csrf_exempt
@login_required(login_url='/login')
def strategy(request):
    print(f"strategy() Request = {request.body}")
    # Strategy must be via POST/DELETE
    if request.method not in ("POST", "DELETE"):
        return HttpResponse(status=400, reason="POST/DELETE request required.")

    # Check input json
    data = json.loads(request.body)

    # Get data
    id = data.get("id", "")

    # Validations for POST
    if request.method == "POST":    
        name = data.get("name", "")
        positions = data.get("positions", "")

        if not name:
            return HttpResponse(status=400, reason="You must give it a name.")

        strategy = Strategy.objects.filter(name=name)
        if strategy and strategy.first().id != id:
            return HttpResponse(status=400, reason=f"There is already a strategy called '{name}'. please select another name.")

        pos_filtered = {k: v for k, v in positions.items() if v['bet'] > 0}

    try:
        if id:
            # Get Strategy from DB 
            strategy = Strategy.objects.get(pk=int(id))
            if request.method == "DELETE": 
                strategy.delete()
                return JsonResponse({"message": "Strategy deleted successfully."}, status=201)  
            else:
                # and clean all Bets to save again
                strategy.name = name
                strategy.bets.all().delete()
        elif request.method == "DELETE": 
            return HttpResponse(status=400, reason="Strategy not found.")
        else:
            # Create a Strategy and save to DB
            strategy = Strategy(user=request.user, name=name)
        bets = []
        # Create the Bets
        for key, value in pos_filtered.items():
            position = Position.objects.get(name=str(key))
            bets.append(Bet(strategy=strategy, position=position, amount=int(value['bet'])))

    except Strategy.DoesNotExist:
        return HttpResponse(status=400, reason="Strategy not found.")
    except Position.DoesNotExist:
        return HttpResponse(status=400, reason="Position not found.")
    except ValueError:
        return HttpResponse(status=400, reason="Invalid bet.")
    except Exception:
        return HttpResponse(status=400, reason="Something bad happened. Please reload the page and try again.")
    else:
        # Success! No exceptions, so lets save all to DB, Strategy and Bets.
        strategy.save()
        Bet.objects.bulk_create(bets)
        return JsonResponse({"message": "Strategy saved successfully."}, status=201)  
    
@csrf_exempt
@login_required(login_url='/login')
def strategies(request):
    # Get strategies
    if request.method != "GET":
        return HttpResponse(status=400, reason="GET request required.")

    strategies = Strategy.objects.filter(user=request.user)

    # Return strategies in reverse chronologial order
    strategies = strategies.order_by("-timestamp").all()
    strategies_list = [st.serialize() for st in strategies]
    print(f"strategies_list = {strategies_list}")
    return JsonResponse(strategies_list, safe=False)   


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "roulette/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "roulette/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        first_name = request.POST["first_name"]
        last_name = request.POST["last_name"]
        if password != confirmation:
            return render(request, "roulette/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password, first_name=first_name, last_name=last_name)
            user.save()
        except IntegrityError:
            return render(request, "roulette/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "roulette/register.html")

