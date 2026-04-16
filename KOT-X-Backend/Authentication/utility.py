# utility.py - SIMPLE password checker
import re


def check_pass(password):
    """
    Check if password has all required characters
    Returns: (is_valid , error_message, error_type)
    """
    # Check each requirement
    if not re.search(r"[A-Z]", password):
        return False, "Password needs an uppercase letter", "UPPERCASE_MISSING"

    if not re.search(r"[a-z]", password):
        return False, "Password needs a lowercase letter", "LOWERCASE_MISSING"

    if not re.search(r"[0-9]", password):
        return False, "Password needs a number", "NUMBER_MISSING"

    if not re.search(r'[!@#$%^&*()_+\-=\[\]{};:\'",.<>/?\\|`~]', password):
        return (
            False,
            "Password needs a special character (!@#$ etc.)",
            "SPECIAL_CHAR_MISSING",
        )

    if re.search(r"\s", password):
        return False, "Password cannot have spaces", "SPACE_FOUND"

    # Check length (adding this as it was mentioned in your note)
    if len(password) < 8:
        return False, "Password must be at least 8 characters long", "LENGTH_TOO_SHORT"

    # If all checks pass
    return True, "Password is valid", "VALID"
