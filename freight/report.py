"""Build the two-page assessment report after running the supplied scorer."""
import json
from pathlib import Path

import pandas as pd
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen.canvas import Canvas
from reportlab.platypus import Paragraph

W,H = letter
INK = "#172F35"
MUTED = "#435F65"
ACCENT = "#006D70"
LINE = "#CADAD9"
LEFT = 48
WIDTH = W - 2*LEFT


def write_report():
    results = json.loads(Path("evaluation.json").read_text())
    july, september = results["folds"]
    model = results["chosen"]
    c = Canvas("freight_rate_report.pdf", pagesize=letter)
    c.setTitle("Freight rate prediction | Validation report")

    def text(x, y, message, face="Helvetica", size=11, color=INK):
        c.setFont(face,size)
        c.setFillColor(HexColor(color))
        c.drawString(x,y,message)

    def prose(y, message):
        style = ParagraphStyle("Body", fontName="Helvetica", fontSize=11, leading=16,
                               textColor=HexColor(INK), alignment=TA_LEFT)
        para = Paragraph(message,style)
        _, h = para.wrap(WIDTH,700)
        para.drawOn(c,LEFT,y-h)
        return y-h-13

    def section(y, title):
        text(LEFT,y,title,"Helvetica-Bold",15)
        return y-13

    def page(n, title):
        c.setStrokeColor(HexColor(ACCENT))
        c.setLineWidth(3)
        c.line(LEFT,744,78,744)
        text(89,741,"FREIGHT PRICING   /   MODEL EVALUATION","Helvetica-Bold",9,ACCENT)
        text(LEFT,693,title,"Helvetica-Bold",29)
        c.setStrokeColor(HexColor(LINE))
        c.setLineWidth(.6)
        c.line(LEFT,42,W-LEFT,42)
        text(LEFT,26,"Freight Rate Prediction Challenge   /   Supplied 2025 load records",size=9,color=MUTED)
        text(W-74,26,f"{n}  /  2",size=9,color=MUTED)

    page(1,"Predicting a posted load rate")
    y = prose(672, "Across 9,523 September and October loads, the selected model had a mean absolute error of "
              f"<b>${september[model]['mae']:.2f} per load</b>. The equipment-specific mileage baseline averaged "
              f"${september['baseline']['mae']:.2f}. Final November and December labels are held by the evaluator.")
    y = section(y-11,"Two forward-looking backtests")
    y = prose(y, "Train on January through June and compare two models on July and August. Select the lower dollar MAE, freeze the specification, refit through August and evaluate September and October once. Refit on all 48,000 January-October loads to predict the 12,000 November-December loads. Splits use service dates and keep each entire day together.")
    rows = [
        ("Evaluation window", "Model","MAE","RMSE","Median AE"),
        ("Jul-Aug / 9,671", "Equipment baseline", *[july['baseline'][m] for m in ['mae','rmse','median_abs_error']]),
        ("Jul-Aug / 9,671", "Main effects", *[july['main_effects'][m] for m in ['mae','rmse','median_abs_error']]),
        ("Jul-Aug / 9,671", "With interactions", *[july[model][m] for m in ['mae','rmse','median_abs_error']]),
        ("Sep-Oct / 9,523", "Equipment baseline", *[september['baseline'][m] for m in ['mae','rmse','median_abs_error']]),
        ("Sep-Oct / 9,523", "With interactions", *[september[model][m] for m in ['mae','rmse','median_abs_error']]),
    ]
    y -= 6
    for i,row in enumerate(rows):
        c.setFillColor(HexColor("#D9EEEC" if i==0 else ("#F1F7F6" if i%2 else "#FFFFFF")))
        c.rect(LEFT,y-5,WIDTH,23,fill=1,stroke=0)
        for j,x in enumerate([LEFT+8,LEFT+131,LEFT+305,LEFT+374,LEFT+440]):
            v=row[j]
            text(x,y+2,f"${v:,.2f}" if isinstance(v,float) else v,"Helvetica-Bold" if i==0 else "Helvetica",9.5)
        y-=23
    y=section(y-9,"Data quality and feature choices")
    y=prose(y,"The development set has 64 pickup cities, three equipment types and no repeated load IDs. Eight additional cities appear in the final inputs. Nonpositive weights (292) and absent weights (300) use a training equipment median. Missing market observations (374) use a trailing seven-day median of daily market medians learned in the training fold. Missing-value flags remain available to the model.")
    y=prose(y,"A tempting feature, quote_signal, changes meaning across months. Its rank correlation with the observed dollars per mile is +0.97 in March, -0.96 in April and -0.02 in August. The model excludes it. Dollar-per-mile values range from 0.33 to 14.13, compared with a median of 2.15. Robust fitting limits extreme targets' influence. All loads remain in reported errors.")
    c.showPage()
    page(2,"From load details to a quote")
    y=prose(672,"The model estimates dollars per mile and multiplies by supplied road distance. Regularized linear terms capture distance scaling, equipment, weight, market conditions, weekday and time trend. Pairwise terms capture direction, lane, equipment by city and equipment by market or weight. Sparse one-hot encoding ignores previously unseen categories, allowing shared features to carry new cities.")
    y=prose(y,"Five rounds of Huber-style reweighting reduce sensitivity to extreme rates. The baseline multiplies miles by the equipment's median historical dollars per mile. Model selection uses dollar MAE, which is interpretable as the average absolute quote error. RMSE highlights tail risk. Variation across chronological windows limits the accuracy claim for future months.")
    y=section(y-6,"Fixed December lane")
    y=prose(y,"The supplied chart specifies only cities, miles, equipment, weight and date. City coordinates come from the fitted development data. The missing market index uses the last available training estimate. On September-October records with this reduced input schema, model MAE was "
            f"${september['chart_schema']['mae']:.2f}. The December curve reflects the fitted weekday pattern and date trend under these fixed assumptions.")
    chart = ImageReader("scorer_results/candidate_december.png")
    iw,ih=chart.getSize()
    chart_h=WIDTH*ih/iw
    c.drawImage(chart,LEFT,y-chart_h,WIDTH,chart_h)
    y-=chart_h+18
    dates=pd.read_csv("december_predictions.csv")
    y=prose(y,f"The model predicts ${dates.predicted_rate.min():,.2f} to ${dates.predicted_rate.max():,.2f} on this lane. The supplied scorer accepted all 12,000 load IDs and 31 fixed dates and generated the chart above. It checks output structure and leaves final accuracy scoring to the evaluator.")
    c.save()


if __name__ == "__main__":
    write_report()
