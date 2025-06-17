
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

const Agreement = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Subscriber Agreement for Medical Exam Question Banks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-6 text-sm leading-relaxed">
              <p>
                This Subscriber Agreement ("Agreement") is entered into between SaudiKnowledgeSeeker Company ("Provider"), 
                owner of the medical exam question banks, including Preventive Medicine (Part 1, Part Final, Promotion 1, 2, 3, 
                and Final Clinical Examination) ("Materials"), and the individual or entity subscribing to access the Materials ("Subscriber"). 
                By clicking "Agree," the Subscriber agrees to be bound by the terms below.
              </p>

              <div>
                <h3 className="font-semibold text-lg mb-3">1. Access</h3>
                <p className="mb-2">
                  1.1 The Provider grants the Subscriber a non-exclusive, non-transferable, limited license to access 
                  the selected Materials for personal, non-commercial educational purposes, such as exam preparation.
                </p>
                <p>
                  1.2 Access is provided via SaudiKnowledgeSeeker platform and requires an active subscription and 
                  compliance with this Agreement.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">2. Intellectual Property</h3>
                <p className="mb-2">
                  2.1 The Materials, including questions, and explanations, are the Provider's exclusive intellectual property, 
                  protected by copyright and other laws.
                </p>
                <p>
                  2.2 No ownership or rights to the Materials are transferred, and all rights not granted are reserved by the Provider.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">3. Use Restrictions</h3>
                <p className="mb-2">3.1 The Subscriber shall not:</p>
                <ul className="list-disc list-inside ml-4 space-y-1 mb-2">
                  <li>Copy, reproduce, distribute, publish, or share the Materials, in whole or part, in any form without prior written consent.</li>
                  <li>Modify, adapt, or create derivative works from the Materials.</li>
                  <li>Share access credentials with third parties.</li>
                  <li>Use the Materials for commercial purposes, e.g., resale or training.</li>
                </ul>
                <p>
                  3.2 Unauthorized use is a breach of this Agreement and violates the Provider's intellectual property rights.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">4. Breach Consequences</h3>
                <p className="mb-2">4.1 Upon breach, including unauthorized copying or distribution:</p>
                <ul className="list-disc list-inside ml-4 space-y-1 mb-2">
                  <li>Access will be terminated immediately without refund.</li>
                  <li>Legal action will be pursued for damages and injunctive relief under intellectual property laws.</li>
                </ul>
                <p>
                  4.2 The Subscriber is liable for all legal fees and damages incurred by the Provider.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">5. Confidentiality</h3>
                <p>
                  5.1 The Subscriber agrees to treat the Materials as confidential and prevent unauthorized disclosure.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">6. Term and Termination</h3>
                <p className="mb-2">
                  6.1 This Agreement remains in effect during the active subscription or until terminated.
                </p>
                <p className="mb-2">
                  6.2 The Provider may terminate the Agreement upon breach, effective immediately with written notice.
                </p>
                <p>
                  6.3 Upon termination, the Subscriber must cease using and destroy all copies of the Materials.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">7. Liability Limitation</h3>
                <p className="mb-2">
                  7.1 The Materials are provided "as is." The Provider does not guarantee accuracy or suitability for exams.
                </p>
                <p>
                  7.2 The Provider is not liable for damages arising from use of the Materials.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">8. Governing Law</h3>
                <p className="mb-2">
                  8.1 This Agreement is governed by the laws of Saudi Arabia jurisdiction.
                </p>
                <p>
                  8.2 Disputes will be resolved via courts in Saudi Arabia.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">9. Entire Agreement</h3>
                <p className="mb-2">
                  9.1 This Agreement supersedes all prior understandings.
                </p>
                <p>
                  9.2 The Provider may amend the Agreement, notifying the Subscriber via email.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">10. Acknowledgment</h3>
                <p>
                  By clicking "Agree," the Subscriber acknowledges understanding and agreeing to these terms. 
                  Unauthorized use will result in legal action to protect the Provider's rights.
                </p>
              </div>

              <Separator className="my-6" />

              <div>
                <h3 className="font-semibold text-lg mb-3">Contact Information:</h3>
                <p>SaudiKnowledgeSeeker Company</p>
                <p>Company Email: [Contact Email to be provided]</p>
              </div>

              <Separator className="my-8" />

              {/* Arabic Version */}
              <div className="text-right" dir="rtl">
                <h2 className="font-bold text-xl mb-6 text-center">
                  اتفاقية الاشتراك في بنوك أسئلة الامتحانات الطبية
                </h2>

                <p className="mb-4">
                  تُبرم هذه الاتفاقية بين شركة SaudiKnowledgeSeeker ("المزود")، مالكة بنوك أسئلة الامتحانات الطبية، 
                  بما في ذلك الطب الوقائي (الجزء الأول، النهائي، الترقية 1، 2، 3، والامتحان السريري النهائي) ("المواد")، 
                  والفرد أو الكيان الذي يشترك للوصول إلى المواد ("المشترك"). بالضغط على "أوافق"، يلتزم المشترك بشروط الاتفاقية أدناه.
                </p>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">1. الوصول</h3>
                    <p className="mb-2">
                      1.1 يمنح المزود المشترك ترخيصًا محدودًا غير حصري وغير قابل للنقل للوصول إلى المواد المختارة 
                      لأغراض تعليمية شخصية غير تجارية، مثل التحضير للامتحانات.
                    </p>
                    <p>
                      1.2 يتم توفير الوصول عبر منصة SaudiKnowledgeSeeker ويتطلب اشتراكًا نشطًا والامتثال لهذه الاتفاقية.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-2">2. الملكية الفكرية</h3>
                    <p className="mb-2">
                      2.1 المواد، بما في ذلك الأسئلة، التفسيرات، هي ملكية فكرية حصرية للمزود، 
                      محمية بقوانين حقوق الطبع والنشر وغيرها.
                    </p>
                    <p>
                      2.2 لا تُنقل حقوق الملكية للمشترك، وجميع الحقوق غير الممنوحة محفوظة للمزود.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-2">3. قيود الاستخدام</h3>
                    <p className="mb-2">3.1 يُحظر على المشترك:</p>
                    <ul className="list-disc list-inside mr-4 space-y-1 mb-2">
                      <li>نسخ، إعادة إنتاج، توزيع، نشر، أو مشاركة المواد، كليًا أو جزئيًا، بأي شكل دون موافقة خطية مسبقة.</li>
                      <li>تعديل، تكييف، أو إنشاء أعمال مشتقة من المواد.</li>
                      <li>مشاركة بيانات الوصول مع أطراف ثالثة.</li>
                      <li>استخدام المواد لأغراض تجارية، مثل إعادة البيع أو التدريب.</li>
                    </ul>
                    <p>
                      3.2 الاستخدام غير المصرح به يُعد خرقًا للاتفاقية وانتهاكًا لحقوق الملكية الفكرية.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-2">4. عواقب الخرق</h3>
                    <p className="mb-2">4.1 عند الخرق، بما في ذلك النسخ أو التوزيع غير المصرح به:</p>
                    <ul className="list-disc list-inside mr-4 space-y-1 mb-2">
                      <li>يُنهى الوصول فورًا دون استرداد الرسوم.</li>
                      <li>يتم اتخاذ إجراءات قانونية للحصول على تعويضات وأوامر قضائية بموجب قوانين الملكية الفكرية.</li>
                    </ul>
                    <p>
                      4.2 المشترك مسؤول عن جميع الرسوم القانونية والأضرار التي يتكبدها المزود.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-2">5. السرية</h3>
                    <p>
                      5.1 يوافق المشترك على التعامل مع المواد كمعلومات سرية ومنع الكشف غير المصرح به.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-2">6. المدة والإنهاء</h3>
                    <p className="mb-2">
                      6.1 الاتفاقية سارية طوال الاشتراك النشط أو حتى الإنهاء.
                    </p>
                    <p className="mb-2">
                      6.2 يجوز للمزود إنهاء الاتفاقية عند الخرق، بأثر فوري عند الإخطار الكتابي.
                    </p>
                    <p>
                      6.3 عند الإنهاء، يجب على المشترك التوقف عن استخدام المواد وتدمير جميع النسخ.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-2">7. تحديد المسؤولية</h3>
                    <p className="mb-2">
                      7.1 المواد مقدمة "كما هي". لا يضمن المزود دقة أو ملاءمة المواد للامتحانات.
                    </p>
                    <p>
                      7.2 المزود غير مسؤول عن أي أضرار ناتجة عن استخدام المواد.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-2">8. القانون الحاكم</h3>
                    <p className="mb-2">
                      8.1 تُحكم الاتفاقية بقوانين المملكة العربية السعودية.
                    </p>
                    <p>
                      8.2 تُحل النزاعات عبر المحاكم في المملكة العربية السعودية.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-2">9. الاتفاقية الكاملة</h3>
                    <p className="mb-2">
                      9.1 هذه الاتفاقية تحل محل جميع التفاهمات السابقة.
                    </p>
                    <p>
                      9.2 يجوز للمزود تعديل الاتفاقية، مع إخطار المشترك عبر البريد الإلكتروني.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-2">10. التأكيد</h3>
                    <p>
                      بالضغط على "أوافق"، يقر المشترك بفهم والالتزام بهذه الشروط. الاستخدام غير المصرح به 
                      سيؤدي إلى إجراءات قانونية لحماية حقوق المزود.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-2">معلومات التواصل:</h3>
                    <p>شركة SaudiKnowledgeSeeker</p>
                    <p>البريد الإلكتروني: [سيتم توفير البريد الإلكتروني]</p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default Agreement;
