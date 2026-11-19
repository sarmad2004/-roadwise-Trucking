# Freight rate prediction

This independent assessment predicts the posted price in US dollars for every November and December 2025 load. The completed prediction files, evaluator-produced chart and two-page report are included.

## Reproduce

From this directory with Python 3.12, run:

```bash
python -m venv .venv
. .venv/bin/activate
python -m pip install -r requirements.txt
OPENBLAS_NUM_THREADS=1 OMP_NUM_THREADS=1 python train.py
python score.py --predictions validation_predictions.csv --december-predictions december_predictions.csv
python -m unittest -v test_model
python report.py
```

Place the original assessment inputs in `data/` using the four filenames below. Use the CSVs supplied with the assessment. The training pipeline keeps those inputs intact. December output is written separately so the original template remains available.

| File | Purpose |
| --- | --- |
| `data/train_test.csv` | 48,000 labeled development loads |
| `data/validation.csv` | 12,000 unlabeled final loads |
| `data/validation_predictions_template.csv` | Expected final IDs and order |
| `data/december_chart_inputs.csv` | 31 daily prices for the fixed Lexington to Fort Wayne lane |
| `train.py` | Feature preparation, robust regression, two chronological evaluations and full-data refit |
| `evaluation.json` | Counts and metrics from both backtests |
| `validation_predictions.csv` | Completed submission in template order |
| `december_predictions.csv` | Completed fixed-input December series |
| `score.py` | Unmodified supplied validation and chart script |
| `scorer_results/candidate_december.png` | Original scorer-produced chart |
| `freight_rate_report.pdf` | Validation approach, metrics, data quality, model and chart |

The estimator uses only fields available at prediction time. The training code excludes load IDs and the unstable quote signal from model features. It evaluates all holdout rows, including extreme rates. Final labels are held by the evaluator.

