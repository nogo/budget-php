SET FOREIGN_KEY_CHECKS=0;
SET AUTOCOMMIT=0;
START TRANSACTION;

DROP VIEW output;

CREATE OR REPLACE VIEW budget_monthly as
  SELECT date_format(date, '%Y-%m') as month, type, sum(amount) as amount FROM budget GROUP BY type, month;

CREATE OR REPLACE VIEW review_monthly as
  SELECT spend.month, COALESCE(income.amount, 0) as income, COALESCE(spend.amount, 0) as spend, (COALESCE(income.amount, 0) - COALESCE(spend.amount, 0)) as total
    FROM budget_monthly as spend
    LEFT JOIN budget_monthly as income ON (spend.month=income.month)
    WHERE spend.type = 'spend' AND income.type = 'income'
  ORDER BY spend.month DESC;

CREATE OR REPLACE VIEW budget_category_monthly_spend as
  SELECT CONCAT(date_format(date, '%Y-%m'), '_', category_id) as joiner, date_format(date, '%Y-%m') as month, category_id, sum(amount) as amount FROM budget WHERE type = 'spend' GROUP BY month, category_id;

CREATE OR REPLACE VIEW budget_category_monthly_income as
    SELECT CONCAT(date_format(date, '%Y-%m'), '_', category_id) as joiner, date_format(date, '%Y-%m') as month, category_id, sum(amount) as amount FROM budget WHERE type = 'income' GROUP BY month, category_id;

CREATE OR REPLACE VIEW review_category_monthly as
    SELECT spend.month, spend.category_id, COALESCE(income.amount, 0) as income, COALESCE(spend.amount, 0) as spend, (COALESCE(income.amount, 0) - COALESCE(spend.amount, 0)) as total
    FROM budget_category_monthly_spend as spend
    LEFT JOIN budget_category_monthly_income as income ON (spend.joiner=income.joiner)
    ORDER BY spend.month DESC;

INSERT INTO `version` VALUES ('20180527120000');

SET FOREIGN_KEY_CHECKS=1;
COMMIT;
