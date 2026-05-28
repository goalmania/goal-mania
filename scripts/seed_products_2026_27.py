#!/usr/bin/env python3
"""
Seed script — inserisce 63 prodotti stagione 2026/27 su MongoDB
Run: python3 scripts/seed_products_2026_27.py
"""

import re
import sys
from datetime import datetime, timezone
from pymongo import MongoClient

MONGODB_URI = "mongodb+srv://root:JYVo6XpXSCJzhP27@cluster0.wbcn3be.mongodb.net/GoalMania?retryWrites=true&w=majority&appName=Cluster0"

# ─── Squadre ──────────────────────────────────────────────────────────────────
SERIE_A = [
    {"name": "Inter",      "league": "Serie A",     "category": "SerieA"},
    {"name": "Milan",      "league": "Serie A",     "category": "SerieA"},
    {"name": "Juventus",   "league": "Serie A",     "category": "SerieA"},
    {"name": "Napoli",     "league": "Serie A",     "category": "SerieA"},
    {"name": "Roma",       "league": "Serie A",     "category": "SerieA"},
    {"name": "Lazio",      "league": "Serie A",     "category": "SerieA"},
    {"name": "Atalanta",   "league": "Serie A",     "category": "SerieA"},
    {"name": "Fiorentina", "league": "Serie A",     "category": "SerieA"},
]

PREMIER = [
    {"name": "Manchester City",   "league": "Premier League", "category": "PremierLeague"},
    {"name": "Liverpool",         "league": "Premier League", "category": "PremierLeague"},
    {"name": "Arsenal",           "league": "Premier League", "category": "PremierLeague"},
    {"name": "Chelsea",           "league": "Premier League", "category": "PremierLeague"},
    {"name": "Manchester United", "league": "Premier League", "category": "PremierLeague"},
    {"name": "Tottenham",         "league": "Premier League", "category": "PremierLeague"},
    {"name": "Newcastle",         "league": "Premier League", "category": "PremierLeague"},
    {"name": "Aston Villa",       "league": "Premier League", "category": "PremierLeague"},
]

EUROPE = [
    {"name": "Real Madrid",       "league": "La Liga",    "category": "Champions"},
    {"name": "Barcelona",         "league": "La Liga",    "category": "Champions"},
    {"name": "Bayern Monaco",     "league": "Bundesliga", "category": "Champions"},
    {"name": "PSG",               "league": "Ligue 1",    "category": "Champions"},
    {"name": "Borussia Dortmund", "league": "Bundesliga", "category": "Champions"},
]

ALL_TEAMS = SERIE_A + PREMIER + EUROPE
KITS = ["Home", "Away", "Third"]


def make_slug(title: str) -> str:
    slug = title.lower()
    slug = re.sub(r"[^a-z0-9]+", "-", slug)
    return slug.strip("-")


def build_description(team: str, kit: str, league: str) -> str:
    kit_it = {"Home": "casa", "Away": "trasferta", "Third": "third"}[kit]
    kit_desc = {
        "Home":  "la divisa ufficiale da casa",
        "Away":  "la divisa ufficiale da trasferta",
        "Third": "la terza divisa ufficiale",
    }[kit]
    return (
        f"Acquista la Maglia {team} {kit} 2026/27 su Goal Mania a soli €30. "
        f"{kit_desc.capitalize()} del {team} per la stagione {league} 2026/27. "
        f"Disponibile in tutte le taglie adulto (S, M, L, XL, XXL). "
        f"Possibilità di personalizzazione con nome e numero del tuo giocatore preferito. "
        f"Spedizione gratuita in tutta Italia. Consegna in 3-5 giorni lavorativi. "
        f"La maglia {team} {kit_it} 2026/27 è il regalo perfetto per ogni tifoso."
    )


def main():
    print("Connecting to MongoDB...")
    client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=15000, tlsAllowInvalidCertificates=True)
    db = client["GoalMania"]
    col = db["products"]
    print("Connected.\n")

    created = 0
    skipped = 0
    now = datetime.now(timezone.utc)

    for team in ALL_TEAMS:
        for kit in KITS:
            title = f"Maglia {team['name']} {kit} 2026/27"
            slug = make_slug(title)

            if col.find_one({"slug": slug}):
                print(f"  SKIP  {title}")
                skipped += 1
                continue

            doc = {
                "title": title,
                "description": build_description(team["name"], kit, team["league"]),
                "basePrice": 30,
                "retroPrice": 35,
                "shippingPrice": 0,
                "stockQuantity": 100,
                "images": ["/images/image.png"],
                "videos": [],
                "category": team["category"],
                "isRetro": False,
                "isWorldCup": False,
                "isMysteryBox": False,
                "hasLongSleeve": False,
                "longSleevePriceAddon": 10,
                "hasShorts": True,
                "hasSocks": True,
                "hasPlayerEdition": True,
                "country": "",
                "nationalTeam": "",
                "adultSizes": ["S", "M", "L", "XL", "XXL"],
                "kidsSizes": [],
                "allowsNumberOnShirt": True,
                "allowsNameOnShirt": True,
                "isActive": True,
                "feature": False,
                "slug": slug,
                "reviews": [],
                "patchIds": [],
                "createdAt": now,
                "updatedAt": now,
            }

            col.insert_one(doc)
            print(f"  OK    {title}")
            created += 1

    print(f"\nDone. Creati: {created} | Saltati (già esistenti): {skipped}")
    client.close()


if __name__ == "__main__":
    main()
