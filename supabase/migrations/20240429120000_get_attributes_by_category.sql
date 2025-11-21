CREATE OR REPLACE FUNCTION get_attributes_by_category(category_id_param UUID)
RETURNS TABLE(id UUID, name TEXT, attribute_options JSON) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.name,
    json_agg(json_build_object('id', ao.id, 'value', ao.value))
  FROM
    attributes a
  JOIN
    attribute_options ao ON a.id = ao.attribute_id
  WHERE
    ao.id IN (
      SELECT DISTINCT
        pa.attribute_option_id
      FROM
        product_attributes pa
      JOIN
        products p ON pa.product_id = p.id
      WHERE
        p.category_id = category_id_param
    )
  GROUP BY
    a.id, a.name;
END;
$$ LANGUAGE plpgsql;
