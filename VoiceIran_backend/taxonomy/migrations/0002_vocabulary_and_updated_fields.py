# Generated manually for VoiceIran Admin Dashboard

from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('taxonomy', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Vocabulary',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=150, verbose_name='نام')),
                ('name_en', models.CharField(blank=True, max_length=150, verbose_name='نام انگلیسی')),
                ('machine_name', models.SlugField(max_length=160, unique=True, verbose_name='نام ماشینی')),
                ('description', models.TextField(blank=True, verbose_name='توضیحات')),
                ('is_hierarchical', models.BooleanField(default=False, verbose_name='سلسله‌مراتبی')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='زمان ایجاد')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='زمان بروزرسانی')),
            ],
            options={
                'verbose_name': 'واژگان',
                'verbose_name_plural': 'واژگان‌ها',
            },
        ),
        migrations.AddField(
            model_name='term',
            name='vocabulary',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='terms',
                to='taxonomy.vocabulary',
                verbose_name='واژگان'
            ),
        ),
        migrations.AddField(
            model_name='term',
            name='created_at',
            field=models.DateTimeField(
                auto_now_add=True,
                default=django.utils.timezone.now,
                verbose_name='زمان ایجاد'
            ),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='term',
            name='updated_at',
            field=models.DateTimeField(auto_now=True, verbose_name='زمان بروزرسانی'),
        ),
    ]
