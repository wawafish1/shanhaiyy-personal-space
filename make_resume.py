"""Build a contact-safe public resume, without modifying the original PDF."""
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT
import shutil

ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT.parent / 'output' / 'pdf'
OUTPUT.mkdir(parents=True, exist_ok=True)
pdfmetrics.registerFont(TTFont('Chinese', 'C:/Windows/Fonts/msyh.ttc', subfontIndex=0))
pdfmetrics.registerFont(TTFont('ChineseBold', 'C:/Windows/Fonts/msyhbd.ttc', subfontIndex=0))
target = OUTPUT / 'yu-binbin-resume.pdf'
c = canvas.Canvas(str(target), pagesize=(595.28, 841.89))
c.setTitle('于彬彬 - 简历')
c.setAuthor('于彬彬')
ink = HexColor('#203c30')
muted = HexColor('#606a61')
style = ParagraphStyle('Body', fontName='Chinese', fontSize=9, leading=15, textColor=muted, alignment=TA_LEFT)
bold_style = ParagraphStyle('Heading', parent=style, fontName='ChineseBold', fontSize=10.5, textColor=ink, leading=17)
y = 797

def para(text, gap=6, bold=False):
    global y
    p = Paragraph(text, bold_style if bold else style)
    _, height = p.wrap(499, 700)
    p.drawOn(c, 48, y - height)
    y -= height + gap

def section(title):
    global y
    y -= 8
    c.setStrokeColor(HexColor('#d7ddcf'))
    c.line(48, y, 547, y)
    y -= 19
    para(title, 7, True)

c.setFillColor(ink)
c.setFont('ChineseBold', 28)
c.drawString(48, y - 27, '于彬彬')
c.setFont('Chinese', 9)
c.drawRightString(547, y - 10, '地点开放 · 接受出差')
c.drawRightString(547, y - 27, 'xyu024864@gmail.com')
c.linkURL('mailto:xyu024864@gmail.com', (409, y - 30, 547, y - 18), relative=0)
y -= 57
para('工业现场 · 客户协作 · AI 实践', 9, True)
para('测控技术与仪器专业背景，有焊接机器人现场交付、客户协作与需求验证经历。希望从一线交付经验出发，走向更靠近客户与业务的工作，关注工业智能、AI 基础设施与先进制造。')
section('工作经历')
para('系统集成工程师　|　2025.09 - 2026.06', 3, True)
para('无锡砺成智能科技有限公司（信捷电气机器人部）', 8)
para('• 客户现场交付：进场前确认准备条件，协调客户与公司人员安装；开展焊接机器人调试、工艺调整、操作培训及质检验收。')
para('• 非标交付处理：针对实际工件与预设模板不匹配的问题，优化操作步骤与工艺，编写临时操作手册，培训客户安排的 1-2 名操作人员，将效率推进至客户可接受范围并完成验收。')
para('• 需求发现与验证：记录高频工件的人工作业痛点，通过出差报告反馈；参与同一工件的机械设计与工艺试样验证，反馈改进意见。相关需求后来转化为新增订单。')
section('AI 项目实践')
para('AI 内容研究与创作工作流　|　两个独立应用，已部署', 4, True)
para('写作助手：热点扫描、多源资料整理、证据简报、写作风格分析与内容草稿。<br/>视频转文章：视频转写、内容清洗、摘要与短帖、Thread、长文草稿整理。')
para('<link href="https://mywriting-assistant.xyz/research" color="#244b3d">mywriting-assistant.xyz/research</link>　|　<link href="https://video.mywriting-assistant.xyz/" color="#244b3d">video.mywriting-assistant.xyz</link>', 10)
para('FitAI 轻盈计划　|　已部署', 4, True)
para('从个人减脂与训练场景出发，围绕拍照、核对、保存组织饮食记录，支持食物识别、份量编辑、营养汇总、身体趋势及阶段复盘。')
para('<link href="https://app.fitai.website/" color="#244b3d">app.fitai.website</link>　|　<link href="https://github.com/wawafish1/fitai" color="#244b3d">github.com/wawafish1/fitai</link>', 4)
section('内容实践与个人兴趣')
para('内容账号：X 关注者 2K+；币安广场粉丝 12K+。围绕科技、AI 与市场话题整理信息和撰写内容。<br/>个人兴趣：徒步、雪山、摄影、训练。')
section('教育背景')
para('南京理工大学紫金学院　|　本科', 4, True)
para('测控技术与仪器', 0)
if y < 40:
    raise RuntimeError(f'Resume overflows the one-page layout: y={y}')
c.save()
shutil.copy2(target, ROOT / 'assets' / target.name)
print(f'Created {target}; remaining bottom space: {y:.1f}pt')
