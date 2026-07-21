"""
One-shot fix: Updates the `topic` field for all 181 seeded problems
to use exact canonical topic names, grouped by their problem_code ranges.
Uses SQLAlchemy directly (same as the seeder).
"""
import os, sys
from dotenv import load_dotenv

load_dotenv()

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
session = Session()

# Maps problem_code range (1-indexed, inclusive) -> canonical topic name
# Based on the generation order in TARGET_TOPICS (15 problems each)
TOPIC_RANGES = [
    (1,   15,  "Arrays"),
    (16,  30,  "Sorting"),
    (31,  45,  "Binary Search"),
    (46,  60,  "Strings"),
    (61,  75,  "Linked List"),
    (76,  90,  "Recursion"),
    (91,  105, "Bit Manipulation"),
    (106, 120, "Stack"),
    (121, 136, "Queue"),
    (137, 151, "Sliding Window"),
    (152, 166, "Two Pointers"),
    (167, 181, "Heaps"),
]

def fix_topics():
    print("=== Topic Fix Script ===\n")
    total_fixed = 0
    total_ok = 0
    total_skip = 0

    rows = session.execute(text("SELECT id, problem_code, topic, title FROM problems ORDER BY problem_code::integer")).fetchall()
    print(f"Fetched {len(rows)} problems from DB.\n")

    for row in rows:
        prob_id, code_str, current_topic, title = row.id, row.problem_code, row.topic, row.title
        try:
            code = int(code_str)
        except (ValueError, TypeError):
            print(f"  [SKIP] Cannot parse problem_code='{code_str}' for '{title}'")
            total_skip += 1
            continue

        canonical_topic = None
        for start, end, topic in TOPIC_RANGES:
            if start <= code <= end:
                canonical_topic = topic
                break

        if canonical_topic is None:
            print(f"  [SKIP] No range match for problem_code={code} ('{title}')")
            total_skip += 1
            continue

        if current_topic == canonical_topic:
            print(f"  [OK]   #{code:03d} '{title}' — topic already correct: '{canonical_topic}'")
            total_ok += 1
            continue

        session.execute(
            text("UPDATE problems SET topic = :topic WHERE id = :id"),
            {"topic": canonical_topic, "id": prob_id}
        )
        print(f"  [FIX]  #{code:03d} '{title}' — '{current_topic}' → '{canonical_topic}'")
        total_fixed += 1

    session.commit()
    print(f"\n=== Done! Fixed={total_fixed}  Already-correct={total_ok}  Skipped={total_skip} ===")

if __name__ == "__main__":
    fix_topics()
