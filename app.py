from flask import Flask, render_template, request, jsonify, redirect, url_for, session
import json
import os
from datetime import datetime

app = Flask(__name__)
app.secret_key = "your_secret_key"  # change this in production

DATA_FILE = "data.json"

# Simple demo credentials
USERNAME = "Girija"
PASSWORD = "1234"

# Ensure data file exists
if not os.path.exists(DATA_FILE):
    with open(DATA_FILE, "w") as f:
        json.dump([], f)


def read_data():
    with open(DATA_FILE, "r") as f:
        return json.load(f)


def write_data(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=2)


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form.get("username", "")
        password = request.form.get("password", "")
        if username == USERNAME and password == PASSWORD:
            session["user"] = username
            return redirect(url_for("welcome"))
        return render_template("login.html", error="Invalid username or password")
    return render_template("login.html")


@app.route("/welcome")
def welcome():
    if "user" not in session:
        return redirect(url_for("login"))
    return render_template("welcome.html")


@app.route("/")
def home():
    if "user" not in session:
        return redirect(url_for("login"))
    return render_template("index.html")

@app.route("/graph")
def graph():
    if "user" not in session:
        return redirect(url_for("login"))
    return render_template("graph.html")


@app.route("/category")
def category():
    if "user" not in session:
        return redirect(url_for("login"))
    return render_template("category.html")


@app.route("/profile")
def profile():
    if "user" not in session:
        return redirect(url_for("login"))
    return render_template("profile.html")


@app.route("/logout")
def logout():
    session.pop("user", None)
    return redirect(url_for("login"))


@app.route("/get-records", methods=["GET"])
def get_records():
    if "user" not in session:
        return jsonify({"error": "Unauthorized"}), 401
    return jsonify(read_data())


@app.route("/add-record", methods=["POST"])
def add_record():
    if "user" not in session:
        return jsonify({"error": "Unauthorized"}), 401

    payload = request.get_json(force=True)
    # expected: {type: 'income'|'expense', amount: number, category: str, note: str}
    rec = {
        "id": int(datetime.utcnow().timestamp() * 1000),
        "type": payload.get("type"),
        "amount": float(payload.get("amount", 0) or 0),
        "category": payload.get("category") or ("Salary" if payload.get("type") == "income" else "General"),
        "note": payload.get("note", ""),
        "timestamp": datetime.utcnow().isoformat()  # store as ISO UTC
    }
    data = read_data()
    data.append(rec)
    write_data(data)
    return jsonify({"message": "Record added", "record": rec}), 200


if __name__ == "__main__":
    app.run(debug=True)