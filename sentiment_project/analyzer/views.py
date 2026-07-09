import os
import json
import google.generativeai as genai
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, serializers
from drf_spectacular.utils import extend_schema, inline_serializer
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

class TourReviewAnalysisView(APIView):
    @extend_schema(
        summary="Phân tích tổng hợp chất lượng Tour từ danh sách đánh giá",
        request=inline_serializer(
            name='TourAnalysisRequest',
            fields={
                'tourName': serializers.CharField(help_text="Tên của tour du lịch"),
                'reviews': serializers.ListField(
                    child=inline_serializer(
                        name='ReviewItem',
                        fields={
                            'userAddress': serializers.CharField(allow_blank=True),
                            'userAge': serializers.CharField(allow_blank=True),
                            'review': serializers.CharField(),
                            'star': serializers.IntegerField()
                        }
                    )
                )
            }
        ),
        responses={200: inline_serializer(
            name='TourAnalysisResponse',
            fields={
                'overall_assessment': serializers.CharField(help_text="Đánh giá tổng quát từ AI"),
                'pros_and_cons': serializers.DictField(help_text="Ưu và nhược điểm rút ra"),
                'recommendations': serializers.CharField(help_text="Lời khuyên cho đơn vị tổ chức"),
                'target_audience': serializers.CharField(help_text="Đối tượng khách hàng phù hợp nhất dựa trên độ tuổi/địa chỉ"),
            }
        )}
    )
    def post(self, request):
        tour_name = request.data.get('tourName', 'Tour không tên')
        reviews = request.data.get('reviews', [])

        if not reviews:
            return Response({"error": "Danh sách đánh giá không được để trống"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Sử dụng model ổn định nhất từ danh sách của bạn
            model = genai.GenerativeModel(
                model_name='gemini-flash-latest', # Hoặc 'gemini-flash-latest'
                generation_config={"response_mime_type": "application/json"}
            )
            
            # Chuẩn bị nội dung đánh giá để gửi cho AI
            reviews_str = json.dumps(reviews, ensure_ascii=False)
            
            prompt = f"""
            Bạn là một chuyên gia phân tích dữ liệu du lịch cấp cao. 
            Hãy phân tích danh sách các đánh giá sau đây cho tour "{tour_name}" và đưa ra báo cáo tổng hợp chất lượng.

            Dữ liệu đánh giá:
            {reviews_str}

            Hãy trả về một đối tượng JSON duy nhất với các trường sau:
            1. overall_assessment: Đánh giá chi tiết về chất lượng dịch vụ dựa trên nội dung và số sao.
            2. pros_and_cons: {{ "pros": [danh sách ưu điểm], "cons": [danh sách nhược điểm] }}.
            3. recommendations: Những lời khuyên cụ thể để cải thiện tour hoặc duy trì chất lượng.
            4. target_audience: Dựa trên userAge và userAddress, hãy nhận xét xem tour này đang thu hút hoặc phù hợp với nhóm khách hàng nào nhất.

            Ngôn ngữ trả về: Tiếng Việt.
            """

            response = model.generate_content(prompt)
            result = json.loads(response.text)
            
            return Response(result, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)