import json
from database import engine, SessionLocal, Base
from models import Problem

# Create tables
Base.metadata.create_all(bind=engine)

def seed_problems():
    db = SessionLocal()
    
    # Check if Two Sum exists
    existing = db.query(Problem).filter(Problem.title == "Two Sum").first()
    if existing:
        db.delete(existing)
        db.commit()

    problem = Problem(
        title="Two Sum",
        description="Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
        difficulty="Easy",
        tags=["Arrays", "Hash Table"],
        companies=["Google", "Amazon", "Meta", "Microsoft"],
        hints=[
          "A brute force approach checks all pairs in O(N^2) time. Can we do better with space?",
          "Can a Hash Table help look up complements in O(1) time?",
          "Iterate once: for element `x`, check if `target - x` is in the hash map."
        ],
        constraints=[
          "2 <= nums.length <= 10^4",
          "-10^9 <= nums[i] <= 10^9",
          "-10^9 <= target <= 10^9",
          "Only one valid answer exists."
        ],
        time_limit=2.0,
        memory_limit=256,
        supported_languages=["python", "cpp"],
        starter_code={
            "python": "class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        # Write your code here\n        pass",
            "cpp": "#include <vector>\n\nclass Solution {\npublic:\n    std::vector<int> twoSum(std::vector<int>& nums, int target) {\n        // Write your code here\n        \n    }\n};"
        },
        sample_test_cases=[
            {"input": "[2,7,11,15]\n9", "expected": "[0, 1]", "explanation": "Because nums[0] + nums[1] == 2 + 7 == 9, we return [0, 1]."},
            {"input": "[3,2,4]\n6", "expected": "[1, 2]", "explanation": "Because nums[1] + nums[2] == 2 + 4 == 6, we return [1, 2]."},
            {"input": "[3,3]\n6", "expected": "[0, 1]", "explanation": "Because nums[0] + nums[1] == 3 + 3 == 6, we return [0, 1]."}
        ],
        hidden_test_cases=[
            {"input": "[1,5,9]\n10", "expected": "[0, 2]"},
            {"input": "[-1,-2,-3,-4,-5]\n-8", "expected": "[2, 4]"}
        ]
    )

    try:
        db.add(problem)
        db.commit()
        print("✅ Successfully seeded 'Two Sum'!")
    except Exception as e:
        db.rollback()
        print(f"❌ Failed to seed problem: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_problems()
