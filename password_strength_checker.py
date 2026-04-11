import re
import math
from getpass import getpass


COMMON_PASSWORDS = {
    "password",
    "123456",
    "123456789",
    "qwerty",
    "abc123",
    "111111",
    "letmein",
    "admin",
    "welcome",
    "iloveyou",
}


def _has_sequential(s):
    sequences = [
        "0123456789",
        "abcdefghijklmnopqrstuvwxyz",
        "qwertyuiop",
        "asdfghjkl",
        "zxcvbnm",
    ]
    s_lower = s.lower()
    for seq in sequences:
        for i in range(len(seq) - 2):
            if seq[i : i + 3] in s_lower:
                return True
    return False


def _has_repeats(s):
    return bool(re.search(r"(.)\1\1", s))


def _estimate_entropy_bits(s):
    pools = 0
    if re.search(r"[a-z]", s):
        pools += 26
    if re.search(r"[A-Z]", s):
        pools += 26
    if re.search(r"[0-9]", s):
        pools += 10
    if re.search(r"[^A-Za-z0-9]", s):
        pools += 33
    if pools == 0:
        return 0.0
    return math.log2(pools) * len(s)


def _label_from_score(score):
    if score >= 80:
        return "Strong"
    if score >= 60:
        return "Good"
    if score >= 40:
        return "Fair"
    if score >= 20:
        return "Weak"
    return "Very Weak"


def check_password_strength(password):
    feedback = []
    score = 0

    length = len(password)
    if length >= 12:
        score += 30
    elif length >= 10:
        score += 22
    elif length >= 8:
        score += 15
    elif length >= 6:
        score += 8
    else:
        feedback.append("Use at least 8 characters.")

    classes = 0
    if re.search(r"[a-z]", password):
        classes += 1
    else:
        feedback.append("Add lowercase letters.")
    if re.search(r"[A-Z]", password):
        classes += 1
    else:
        feedback.append("Add uppercase letters.")
    if re.search(r"[0-9]", password):
        classes += 1
    else:
        feedback.append("Add numbers.")
    if re.search(r"[^A-Za-z0-9]", password):
        classes += 1
    else:
        feedback.append("Add symbols (e.g., !@#$%).")

    score += classes * 10

    if password.lower() in COMMON_PASSWORDS:
        score -= 35
        feedback.append("Avoid common passwords.")

    if _has_sequential(password):
        score -= 10
        feedback.append("Avoid sequences like 123 or abc.")

    if _has_repeats(password):
        score -= 10
        feedback.append("Avoid repeating characters (e.g., aaa).")

    entropy = _estimate_entropy_bits(password)
    score += min(20, int(entropy / 5))

    score = max(0, min(100, score))
    label = _label_from_score(score)

    if not feedback and score >= 60:
        feedback.append("Nice work. Consider using 12+ characters for extra safety.")

    return {
        "score": score,
        "label": label,
        "entropy_bits": round(entropy, 1),
        "feedback": feedback,
    }


def _format_result(result):
    lines = [
        f"Score: {result['score']}/100",
        f"Rating: {result['label']}",
        f"Estimated entropy: {result['entropy_bits']} bits",
    ]
    if result["feedback"]:
        lines.append("Suggestions:")
        for tip in result["feedback"]:
            lines.append(f"- {tip}")
    return "\n".join(lines)


def main():
    print("Password Strength Checker")
    while True:
        pw = getpass("Enter a password (or press Enter to quit): ")
        if pw == "":
            break
        result = check_password_strength(pw)
        print(_format_result(result))
        print()


if __name__ == "__main__":
    main()
