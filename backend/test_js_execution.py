import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.code_executor import execute_with_test_cases

print("Testing JavaScript Execution...")
js_code = """
function solution(args) {
    // args is [2, 7, 11, 15], 9
    // But wait, our runner passes args as "2, 7, 11, 15], 9" string if not careful?
    // No, we did args_js = json.dumps(args) if not tuple string.
    
    // For Two Sum: input "([2,7,11,15], 9)" -> args_js = "[2,7,11,15], 9"
    // So function receives (nums, target)
    
    const nums = args[0];
    const target = args[1];
    // Actually, if we pass multiple args in the function call in runner:
    // func(arg1, arg2)
    // Then checking the runner logic: 
    // args_js = args.strip()[1:-1] -> "2,7,11,15], 9" ?? 
    // Wait, "([2,7], 9)" -> "[2,7], 9".
    // So solution( [2,7], 9 ) is called.
    return [0, 1];
}
"""

# Test Case 1: Two Sum pattern
# Input: "([2,7,11,15], 9)"
# Output: [0, 1]

test_cases = [
    {"input": "([2,7,11,15], 9)", "output": [0, 1]}
]

result = execute_with_test_cases("javascript", js_code, test_cases)
print("JS Result:", result)

print("\nTesting TypeScript Execution...")
ts_code = """
function solution(nums: number[], target: number): number[] {
    return [0, 1];
}
"""
result_ts = execute_with_test_cases("typescript", ts_code, test_cases)
print("TS Result:", result_ts)
