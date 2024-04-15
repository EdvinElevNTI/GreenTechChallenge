from flask import Blueprint, render_template

about_bp = Blueprint('about', __name__)


@about_bp.get("/about")
def about():
    return render_template("about/about.html")

