from django.db import migrations


def add_cover_image_column_if_missing(apps, schema_editor):
    table_name = "news_post"
    existing_columns = {
        col.name for col in schema_editor.connection.introspection.get_table_description(schema_editor.connection.cursor(), table_name)
    }
    if "cover_image" in existing_columns:
        return
    schema_editor.execute(f"ALTER TABLE {schema_editor.quote_name(table_name)} ADD COLUMN cover_image varchar(100) NULL")


class Migration(migrations.Migration):
    dependencies = [
        ("news", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(add_cover_image_column_if_missing, migrations.RunPython.noop),
    ]
